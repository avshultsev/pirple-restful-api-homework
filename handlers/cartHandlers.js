const { createFile, readFile, updateFile, deleteFile } = require('../lib/crud.js');
const { validatePayload } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');

const _get = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const cart = await readFile('carts', `${phone}.json`);
    return {result: cart, statusCode: 200};
  } catch (err) {
    return {result: 'File not found!', statusCode: 404};
  }
};

// const _post = async ({ body }) => {};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  const required = ['name', 'price', 'size'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return {result: 'Missing required fields!', statusCode: 400};
  try {
    const newCartItem = await readFile('items', `${validPayload.name}.json`);
    const { price: prices, sizes } = newCartItem;
    const { price, size } = validPayload;
    const condition = !prices.includes(price) || !sizes.includes(size) || (sizes.indexOf(size) !== prices.indexOf(price));
    if (condition) return {result: 'Invalid payload!', statusCode: 400};
  } catch (err) {
    return {result: 'Item not found!', statusCode: 404};
  }
  try {
    await updateFile('cart', `${phone}.json`, validPayload);
    return {result: 'Cart successfully updated!', statusCode: 200};
  } catch (err) {
    return {result: 'Error updating file!', statusCode: 500};
  }
};

const _delete = async () => {};

module.exports = { _get, _post, _put, _delete };