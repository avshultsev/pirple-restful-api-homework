const { ORDER_ID_LENGTH } = require('../constants.js');
const { createFile, readFile, updateFile, deleteFile, listItems, createFolder } = require('../lib/crud.js');
const { createRandomString } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');

const _post = async (phone) => { // creates a folder for order files
  try {
    await createFolder('orders', phone);
  } catch (err) {
    console.log('Folder already exists!');
  }
};

const _get = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const orders = await listItems('orders', phone);
    const readOrderFiles = order => readFile('orders', phone, order);
    const promises = orders.map(readOrderFiles);
    try {
      const populatedOrders = await Promise.all(promises);
      return {result: populatedOrders, statusCode: 200};
    } catch (err) {
      return {result: 'Server error!', statusCode: 500};
    }
  } catch (err) {
    return {result: 'User orders not found!', statusCode: 403};
  }
};

const _put = async ({ queryParams, token }) => { // updates the orders folder with a new order file
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  return Promise.all([
    readFile('carts', `${phone}.json`),
    readFile('users', `${phone}.json`),
  ])
  .then(([cart, user]) => {
    if (cart.items.length === 0) throw new Error('Error creating an order with empty cart!');
    const orderID = createRandomString(ORDER_ID_LENGTH);
    user.orders.push(orderID);
    const initialCart = { items: [], total: 0 };
    return Promise.all([
      createFile('orders', phone, `${orderID}.json`, cart),
      updateFile('carts', `${phone}.json`, initialCart),
      updateFile('users', `${phone}.json`, user),
    ]);
  })
  .then(() => ({ result: 'Order accepted!', statusCode: 200 }))
  .catch(err => {
    console.log(err);
    return { result: 'Error creating an order!', statusCode: 400 };
  });
};

const _delete = async (phone) => { // deletes entire folder with orders
  try {
    await deleteFile('orders', phone);
    return { result: 'Orders folder deleted successfully!', statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'Error deleting orders folder!', statusCode: 500 };
  }
};

module.exports = { _get, _post, _put, _delete };