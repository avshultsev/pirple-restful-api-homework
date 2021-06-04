const { ORDER_ID_LENGTH } = require('../constants.js');
const { createFile, readFile, updateFile, deleteFile, listItems } = require('../lib/crud.js');
const { createRandomString } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');

const isValid = (item, menuItem) => {
  const { price, size } = item;
  const { prices, sizes } = menuItem;
  const sizeIdx = sizes.indexOf(size);
  const priceIdx = prices.indexOf(price);
  return (priceIdx > -1 && sizeIdx > -1 && sizeIdx === priceIdx);
};

const validateBody = async ({ items, total }) => {
  const promises = items.map(item => readFile('items', `${item.name}.json`));
  try {
    const menuItems = await Promise.all(promises);
    for (const item of items) {
      const menuItem = menuItems.find(menuItem => item.name === menuItem.name);
      const itemIsValid = isValid(item, menuItem);
      if (!itemIsValid) return false;
    }
    const itemsTotal = items.reduce((acc, item) => acc += item.price, 0);
    return itemsTotal === total;
  } catch (err) {
    throw new Error(err);
  }
};

const prepareOrder = async (phone, orderID) => {
  try {
    const order = await readFile('orders', phone, `${orderID}.json`);
    order.isFinished = true;
    try {
      await updateFile('orders', phone, `${orderID}.json`, order);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
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
    cartInfo.isFinished = false;

    setTimeout(() => prepareOrder(phone, orderID), cartInfo.items.length * 1000 * 60); // imitation of the order to be prepared
    
    const initialCart = { items: [], total: 0 };
    await Promise.all([
      createFile('orders', phone, `${orderID}.json`, cartInfo),
      updateFile('carts', `${phone}.json`, initialCart),
      updateFile('users', `${phone}.json`, user)
    ]);
    return {result: 'Order accepted!', statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: 'User cart not found!', statusCode: 404};
  }
};

const _put = async ({ body, queryParams, token }) => {
  const { phone, orderID } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const order = await readFile('orders', phone, `${orderID}.json`);
    if (order.isFinished) return {result: 'Order cannot be updated as it is finished!', statusCode: 400};
    try {
      const isBodyValid = await validateBody(body);
      if (!isBodyValid) return {result: 'Invalid payload!', statusCode: 400};
      body.isFinished = false;
      try {
        await updateFile('orders', phone, `${orderID}.json`, body);
        setTimeout(() => prepareOrder(phone, orderID), body.items.length * 1000 * 60);
        return {result: 'Order updated!', statusCode: 200};
      } catch (err) {
        console.log(err);
        return {result: 'Error updating payload!', statusCode: 500};        
      }
    } catch (err) {
      console.log(err);
      return {result: 'Error validating payload!', statusCode: 500};
    }
  } catch (err) {
    console.log(err);
    return {result: 'Order not found!', statusCode: 404};
  }
};

const _delete = async ({ queryParams, token }) => {
  const { phone, orderID } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const order = await readFile('orders', phone, `${orderID}.json`);
    if (order.isFinished) return {result: 'Order cannot be deleted as it is finished!', statusCode: 400};
    try {
      await deleteFile('orders', phone, `${orderID}.json`);
      return {result: 'Order cancelled!', statusCode: 200};
    } catch (err) {
      console.log(err);
      return {result: 'Error deleting file!', statusCode: 500};
    }
  } catch (err) {
    return {result: 'Order not found!', statusCode: 404};
  }
};

module.exports = { _get, _post, _put, _delete };