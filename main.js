const http = require('http');
const path = require('path');
const fs   = require('fs');
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
};

const staticPath = path.join(process.cwd(), 'public');
const serveFile = fileName => {
  const filePath = path.join(staticPath, fileName);
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  return stream;
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
  const fileExt = path.extname(fileName).substring(1) || 'html';
  const type = MIME_TYPES[fileExt];
  res.writeHead(200, { 'Content-Type': type });
  const stream = serveFile(fileName);
  stream.on('error', (err) => {
    console.log(err);
    const notFound = serveFile('notFound.html');
    notFound.pipe(res);
  });
  stream.pipe(res);
};

http
  .createServer(listener)
  .listen(PORT, () => {
    console.log(`Server started on ${PORT}!`);
  });