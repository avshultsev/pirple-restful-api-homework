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
    console.log(err);
    return {result: 'File not found!', statusCode: 404};
  }
};

const _post = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    await createFile('carts', `${phone}.json`, { items: [], total: 0 });
    return {result: `Cart created for user ${phone}!`, statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: `Cart for user ${phone} already exists!`, statusCode: 400};
  }
};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  const required = ['name', 'price', 'size'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return {result: 'Missing required fields!', statusCode: 400};
  try {
    const newCartItem = await readFile('items', `${validPayload.name}.json`);
    const { prices, sizes } = newCartItem;
    const { price, size } = validPayload;
    const condition = !prices.includes(price) || !sizes.includes(size) || (sizes.indexOf(size) !== prices.indexOf(price));
    if (condition) return {result: 'Invalid payload!', statusCode: 400};
    try {
      const cart = await readFile('carts', `${phone}.json`);
      cart.items.push(validPayload);
      cart.total += price;
      try {
        await updateFile('carts', `${phone}.json`, cart);
        return {result: cart, statusCode: 200};
      } catch (err) {
        return {result: 'Error updating file!', statusCode: 500};
      }
    } catch (err) {
      console.log(err);
      return {result: 'Cart not found!', statusCode: 404};
    }
  } catch (err) {
    return {result: 'Item not found!', statusCode: 404};
  }
};

const _delete = async ({ queryParams, token }) => {
  const { phone, name, size } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const cart = await readFile('carts', `${phone}.json`);
    const itemIdx = cart.items.findIndex(item => (item.name === name && item.size === parseInt(size)));
    const item = cart.items[itemIdx];
    if (!item) return {result: 'Item for deletion not found!', statusCode: 400};
    cart.items.splice(itemIdx, 1);
    cart.total -= item.price;
    try {
      await updateFile('carts', `${phone}.json`, cart);
      return {result: cart, statusCode: 200};
    } catch (err) {
      console.log(err);
      return {result: 'Error updating cart file!', statusCode: 500};
    }
  } catch (err) {
    console.log(err);
    return {result: 'Cart not found!', statusCode: 404};
  }
};

module.exports = { _get, _post, _put, _delete };