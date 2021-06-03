const { createFile, readFile, updateFile, deleteFile, listItems } = require('../lib/crud.js');
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

const _post = async () => {};

const _put = async () => {};

const _delete = async () => {};

module.exports = { _get, _post, _put, _delete };