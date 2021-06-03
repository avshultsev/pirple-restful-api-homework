const { ORDER_ID_LENGTH } = require('../constants.js');
const { createFile, readFile, updateFile, deleteFile, listItems } = require('../lib/crud.js');
const { createRandomString } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');

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

const _post = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const [cartInfo, user] = await Promise.all([
      readFile('carts', `${phone}.json`),
      readFile('users', `${phone}.json`)
    ]);
    const orderID = createRandomString(ORDER_ID_LENGTH);
    user.orders.push(orderID);
    const initialCart = { items: [], total: 0 };
    await Promise.all([
      createFile('orders', phone, `${orderID}.json`, cartInfo),
      updateFile('carts', `${phone}.json`, initialCart),
      updateFile('users', `${phone}.json`, user)
    ]);
    return {result: 'Order accepted!', statusCode: 200};
  } catch (err) {
    return {result: 'User cart not found!', statusCode: 404};
  }
};

const _put = async () => {};

const _delete = async () => {};

module.exports = { _get, _post, _put, _delete };