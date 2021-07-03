const http = require('http');
const path = require('path');
const { promises: fs, createReadStream } = require('fs');
const PORT = process.env.PORT || 3000;
const routing = require('./routing.js');
const { receiveArgs } = require('./lib/utils.js');

const MIME_TYPES = {
  html: 'text/html; charset=UTF-8',
  js: 'application/javascript; charset=UTF-8',
  css: 'text/css',
  png: 'image/png',
  ico: 'image/x-icon',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
};

const cache = new Map();
const staticPath = path.join(process.cwd(), 'public');

const consumeReadStream = async (stream) => {
  let content = '';
  for await (const chunk of stream) content += chunk;
  return content;
};

const getHeadAndFooter = async () => {
  const headPath = path.join(staticPath, '_head.html');
  const footerPath = path.join(staticPath, '_footer.html');
  let head = cache.get(headPath);
  let footer = cache.get(footerPath);
  if (head && footer) return [head, footer];
  const promises = [headPath, footerPath]
    .map(filepath => createReadStream(filepath))
    .map(consumeReadStream);
  [head, footer] = await Promise.all(promises);
  cache.set(headPath, head);
  cache.set(footerPath, footer);
  return [head, footer];
};

const serveFile = async (fileName, ext) => {
  const name = fileName + '.' + ext;
  const filePath = path.join(staticPath, name);
  try {
    await fs.access(filePath);
    const stream = createReadStream(filePath);
    const content = await consumeReadStream(stream);
    if (ext !== 'html') return content;
    const [head, footer] = await getHeadAndFooter();
    return head + content + footer;
  } catch (err) {
    content = await serveFile('notFound', 'html');
    return content;
  }
};

const parseQueryParams = ({ url, headers }) => {
  const { host } = headers;
  const urlObj = new URL(`http://${host}${url}`);
  const queryParams = {};
  const endpoint = urlObj.pathname;
  if (urlObj.search === '') return { queryParams, endpoint };
  const searchParams = urlObj.searchParams.entries();
  for (const [key, value] of searchParams) {
    queryParams[key] = value;
  }
  return { queryParams, endpoint };
};

const notFound = (res) => {
  res.writeHead(404, 'Not Found', {'Content-Type' : 'text/plain'});
  res.end('Not Found');
}

const listener = async (req, res) => {
  const { method, url, headers } = req;
  const { token } = headers;
  const { queryParams, endpoint } = parseQueryParams({ url, headers });
  if (url.startsWith('/api')) {
    let body = null;
    const route = routing[endpoint];
    if (!route) return notFound(res);
    const handler = route[method.toLowerCase()];
    if (!handler) return notFound(res);
    const bodyRequired = handler.toString().startsWith('async ({ body');
    if (bodyRequired) body = await receiveArgs(req);
    const { result, statusCode } = await handler({ body, queryParams, token });
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ result, body }));
  }
  const fileName = url === '/' ? 'index.html' : url;
  const [name, ext] = fileName.split('.');
  const fileExt = ext || 'html';
  const type = MIME_TYPES[fileExt];
  res.writeHead(200, { 'Content-Type': type });
  if (type.startsWith('image/')) {
    const imgPath = path.join(staticPath, fileName);
    const stream = createReadStream(imgPath);
    return stream.pipe(res);
  }
  const content = await serveFile(name, fileExt);
  res.end(content);
};

http
  .createServer(listener)
  .listen(PORT, () => {
    console.log(`Server started on ${PORT}!`);
  });