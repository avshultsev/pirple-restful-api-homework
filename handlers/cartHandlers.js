const { createFile, readFile, updateFile, deleteFile } = require('../lib/crud.js');
const { validatePayload } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');

const isValid = (item, menuItem) => {
  const { price, size } = item;
  const { prices, sizes } = menuItem;
  const sizeIdx = sizes.indexOf(size);
  const priceIdx = prices.indexOf(price);
  return (priceIdx > -1 && sizeIdx > -1 && sizeIdx === priceIdx);
};

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
  return readFile('items', `${validPayload.name}.json`)
    .then(menuItem => {
      const itemValid = isValid(validPayload, menuItem);
      if (!itemValid) throw new Error('Invalid payload!');
      return readFile('carts', `${phone}.json`);
    })
    .then(cart => {
      cart.items.push(validPayload);
      cart.total += validPayload.price;
      return updateFile('carts', `${phone}.json`, cart);
    })
    .then(cart => ({ result: cart, statusCode: 200 }))
    .catch(err => {
      console.log(err);
      return { result: 'Error updating cart!', statusCode: 400 };
    });
};

const _delete = async ({ queryParams, token }) => {
  const { phone, name, size } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  if (!name && !size) {
    try {
      await deleteFile('carts', `${phone}.json`);
      return { result: `Cart of user ${phone} deleted successfully!`, statusCode: 200 };
    } catch (err) {
      console.log(err);
      return { result: `Error deleting cart of user ${phone}!`, statusCode: 500 };
    }
  };
  return readFile('carts', `${phone}.json`)
    .then(cart => {
      const itemIdx = cart.items.findIndex(item => (item.name === name && item.size === parseInt(size)));
      const item = cart.items[itemIdx];
      if (!item) throw new Error('Item for deletion not found!');
      cart.items.splice(itemIdx, 1);
      cart.total -= item.price;
      return updateFile('carts', `${phone}.json`, cart); 
    })
    .then(cart => ({ result: cart, statusCode: 200 }))
    .catch(err => {
      console.log(err);
      return { result: 'Error deleting cart item!', statusCode: 500 };
    });
};

module.exports = { _get, _post, _put, _delete };