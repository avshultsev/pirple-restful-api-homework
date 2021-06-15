const { createFile, readFile, updateFile, deleteFile, rename, createFolder } = require('../lib/crud.js');
const { toHash, validatePayload } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');
const { MIN_PHONE_NUMBER_LENGTH } = require('../constants.js');
const orderHandlers = require('./orderHandlers.js');
const tokenHandlers = require('./stripeHandlers/tokenHandlers.js');
const customerHandlers = require('./stripeHandlers/customerHandlers.js');

const _get = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    const result = await readFile('users', `${phone}.json`);
    delete result.password;
    return { result, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'User not found!', statusCode: 404 }
  }
};

const _post = async ({ body }) => {
  const required = ['firstName', 'lastName', 'phone', 'password'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return {result: 'Missing required fields!', statusCode: 400};
  const { phone, password } = validPayload;
  if (phone.length < MIN_PHONE_NUMBER_LENGTH || /\D/.test(phone)) {
    return {result: 'Phone number too short or contains non numerical chars!', statusCode: 400};
  };
  validPayload.password = toHash(password);
  validPayload.orders = [];
  const { firstName, lastName, phone } = validPayload;
  try {
    customerHandlers.createCustomer({ name: firstName + ' ' + lastName, phone })
      .then(customer => {
        validPayload.customerID = customer.id;
        return Promise.all([
          createFile('users', `${phone}.json`, validPayload),
          orderHandlers.__createOrdersCollection(phone),
        ]);
      }).catch(err => { throw err });
    return {result: 'File created successfully!', statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: 'User already exists!', statusCode: 500};
  }
};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  const required = ['firstName', 'lastName', 'password', 'customerID'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return { result: 'Missing the required fields!', statusCode: 400 };
  validPayload.password = toHash(body.password);
  if (body.card) {
    const cardToken = await tokenHandlers.createCardToken(body.card);
    validPayload.source = cardToken.id;
  }
  const { customerID } = validPayload;
  try {
    await Promise.all([
      customerHandlers.updateCustomer(customerID, validPayload), // to bind card to a customer we pass a token
      updateFile('users', `${validPayload.phone}.json`, {...validPayload, source: cardToken.card.id}), // but in out DB we save cardID itself
    ]);
    return { result: validPayload, statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'User not found!', statusCode: 404 };
  }
};

const _delete = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return {result: 'Unauthenticated!', statusCode: 403};
  try {
    await Promise.all([
      deleteFile('users', `${phone}.json`),
      deleteFile('orders', phone) // change to '_delete' method
    ]);
    return { result: 'File deleted successfully!', statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'User not found!', statusCode: 404 };
  }
};

module.exports = { _get, _post, _put, _delete };