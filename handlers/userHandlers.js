const { createFile, readFile, updateFile, deleteFile, rename, createFolder } = require('../lib/crud.js');
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
  const required = ['firstName', 'lastName', 'phone', 'password'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return { result: 'Missing required fields!', statusCode: 400 };
  const { phone, password, firstName, lastName } = validPayload;
  if (phone.length < MIN_PHONE_NUMBER_LENGTH || /\D/.test(phone)) {
    return { result: 'Phone number too short or contains non numerical chars!', statusCode: 400 };
  };
  validPayload.password = toHash(password);
  validPayload.orders = [];
  return customerHandlers.createCustomer({ name: firstName + ' ' + lastName, phone })
    .then(customer => {
      validPayload.customerID = customer.id;
      return createFile('users', `${phone}.json`, validPayload);
    })
    .then(() => ({ result: 'File created successfully!', statusCode: 200 }))
    .catch(err => {
      console.log(err);
      return { result: 'Error creating Stripe customer!', statusCode: 400 };
    });
};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (!tokenVerified) return { result: 'Unauthenticated!', statusCode: 403 };
  const required = ['firstName', 'lastName', 'phone', 'password', 'customerID'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return { result: 'Missing the required fields!', statusCode: 400 };
  validPayload.password = toHash(body.password);
  const updPayload = { name: validPayload.firstName + ' ' + validPayload.lastName }; // add email,
  return readFile('users', `${phone}.json`)
    .then(({ orders }) => {
      validPayload.orders = orders;
      if (body.card) return tokenHandlers.createCardToken(body.card);
    }).then(cardToken => {
      if (cardToken) {
        updPayload.source = cardToken.id; // tok_...
        validPayload.source = cardToken.card.id; // card_...
      }
      return Promise.all([ // update customer with all required info
        customerHandlers.updateCustomer(validPayload.customerID, updPayload),
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
    await deleteFile('users', `${phone}.json`);
    return { result: 'File deleted successfully!', statusCode: 200 };
  } catch (err) {
    console.log(err);
    return { result: 'User not found!', statusCode: 404 };
  }
};

module.exports = { _get, _post, _put, _delete };