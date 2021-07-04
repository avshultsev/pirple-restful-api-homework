const { createFile, readFile, updateFile, deleteFile, createFolder, rename } = require('../lib/crud.js');
const { toHash, validatePayload } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');
const { MIN_PHONE_NUMBER_LENGTH } = require('../constants.js');
const tokenHandlers = require('./stripeHandlers/tokenHandlers.js');
const customerHandlers = require('./stripeHandlers/customerHandlers.js');

const _get = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return { result: 'Unauthenticated!', statusCode: 403 };
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
  const required = ['firstName', 'lastName', 'phone', 'password', 'email', 'address'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return { result: 'Missing required fields!', statusCode: 400 };
  const { phone, password, firstName, lastName, email, address } = validPayload;
  if (phone.length < MIN_PHONE_NUMBER_LENGTH || /\D/.test(phone)) {
    return { result: 'Phone number too short or contains non numerical chars!', statusCode: 400 };
  };
  validPayload.password = toHash(password);
  validPayload.orders = [];
  const stripeCustomer = { name: firstName + ' ' + lastName, phone, email };
  return customerHandlers.createCustomer(stripeCustomer)
    .then(customer => {
      validPayload.customerID = customer.id;
      return createFile('users', `${phone}.json`, validPayload);
    })
    .then(() => {
      const promises = [
        createFolder('orders', phone),
        createFile('carts', `${phone}.json`, { items: [], total: 0 }),
      ];
      return Promise.all(promises);
    })
    .then(() => ({ result: 'File created successfully!', statusCode: 200 }))
    .catch(err => {
      console.log(err);
      return { result: 'Customer with such phone number already exists!', statusCode: 400 };
    });
};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return { result: 'Unauthenticated!', statusCode: 403 };
  const required = ['firstName', 'lastName', 'phone', 'password', 'email', 'address'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return { result: 'Missing the required fields!', statusCode: 400 };
  validPayload.password = toHash(body.password);
  const { firstName, lastName, email, address } = validPayload;
  const stripeCustomer = { name: firstName + ' ' + lastName, email };
  return readFile('users', `${phone}.json`)
    .then(({ orders, customerID }) => {
      validPayload.customerID = customerID;
      validPayload.orders = orders;
      if (body.card) return tokenHandlers.createCardToken(body.card);
    }).then(cardToken => {
      if (cardToken) {
        stripeCustomer.source = cardToken.id; // tok_...
        validPayload.source = cardToken.card.id; // card_...
      }
      return Promise.all([ // update customer with all required info
        customerHandlers.updateCustomer(validPayload.customerID, stripeCustomer),
        updateFile('users', `${validPayload.phone}.json`, validPayload),
      ]);
    })
    .then(() => ({ result: validPayload, statusCode: 200 }))
    .catch(err => {
      console.log(err);
      return { result: `Error updating user ${phone}!`, statusCode: 500 };
    });
};

const _delete = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return { result: 'Unauthenticated!', statusCode: 403 };
  try {
    const promises = [
      deleteFile('users', `${phone}.json`),
      deleteFile('carts', `${phone}.json`),
      rename('orders', phone, `deleted_${phone}`),
    ];
    await Promise.all(promises);
    return { result: 'User deleted successfully!', statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'User not found!', statusCode: 404 };
  }
};

const userHandlers = { get: _get, post: _post, put: _put, delete:_delete };
module.exports = userHandlers;