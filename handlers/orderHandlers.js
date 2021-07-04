const { ORDER_ID_LENGTH } = require('../constants.js');
const { createFile, readFile, updateFile, deleteFile, listItems, createFolder } = require('../lib/crud.js');
const { createRandomString } = require('../lib/utils.js');
const { sendEmail } = require('./mailgunHandlers/sendEmail.js');
const { chargeCard } = require('./stripeHandlers/chargeHandlers.js');
const { verifyToken } = require('./tokenHandlers.js');

const _get = async ({ queryParams, token }) => {
  const { phone, order } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  if (order) { // if we have an orderID then return a specific order, if not - return all orders
    try {
      const orderInfo = await readFile('orders', phone, `${order}.json`);
      return { result: orderInfo, statusCode: 200 };
    } catch (err) {
      return { result: `Order with ID ${order} not found!`, statusCode: 404 };
    }
  }
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

const _post = async ({ queryParams, token }) => { // create a new order file in the user's orders folder
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  return Promise.all([
    readFile('carts', `${phone}.json`),
    readFile('users', `${phone}.json`),
  ])
  .then(([cart, user]) => {
    if (cart.items.length === 0) throw new Error('Error creating an order with empty cart!');
    if (!user.source) throw new Error('Error attempting to make an order with no payment source attached!');
    return Promise.all([chargeCard(user.customerID, cart.total), cart, user]);
  })
  .then(([charge, cart, user]) => {
    cart.chargeID = charge.id;
    const orderID = createRandomString(ORDER_ID_LENGTH);
    user.orders.push(orderID);
    const initialCart = { items: [], total: 0 };
    return Promise.all([
      createFile('orders', phone, `${orderID}.json`, cart),
      updateFile('carts', `${phone}.json`, initialCart),
      updateFile('users', `${phone}.json`, user),
      sendEmail(cart, user),
    ]);
  })
  .then(() => ({ result: 'Order accepted!', statusCode: 200 }))
  .catch(err => {
    console.log(err);
    return { result: 'Error creating an order!', statusCode: 400 };
  });
};

const _delete = async ({ queryParams }) => { // deletes entire folder with orders
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    await deleteFile('orders', phone);
    return { result: 'Orders folder deleted successfully!', statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'Error deleting orders folder!', statusCode: 500 };
  }
};

const orderHandlers = { get: _get, post: _post, delete: _delete };
module.exports = orderHandlers;