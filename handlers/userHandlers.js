const { createFile, readFile, updateFile, deleteFile, rename, createFolder } = require('../lib/crud.js');
const { toHash, validatePayload } = require('../lib/utils.js');
const { verifyToken } = require('./tokenHandlers.js');
const { MIN_PHONE_NUMBER_LENGTH } = require('../constants.js');

const _get = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (tokenVerified) {
    try {
      const result = await readFile('users', `${phone}.json`);
      delete result.password;
      return {result, statusCode: 200};
    } catch (err) {
      console.log(err);
      return {result: 'User not found!', statusCode: 404}
    }
  }
  return {result: 'Unauthenticated!', statusCode: 403};
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
  const initialCart = { items: [], total: 0 };
  try {
    await Promise.all([
      createFile('users', `${phone}.json`, validPayload),
      createFile('carts', `${phone}.json`, initialCart),
      createFolder('orders', phone)
    ]);
    return {result: 'File created successfully!', statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: 'User already exists!', statusCode: 500};
  }
};

const _put = async ({ body, queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (tokenVerified) {
    const required = ['firstName', 'lastName', 'phone', 'password'];
    const validPayload = validatePayload(required, body);
    if (!validPayload || body.phone.length < MIN_PHONE_NUMBER_LENGTH) {
      return {result: 'Missing the required fields!', statusCode: 400};
    }
    validPayload.password = toHash(body.password);
    if (phone !== body.phone) {
      try {
        await Promise.all([
          rename('users', `${phone}.json`, `${validPayload.phone}.json`),
          rename('carts', `${phone}.json`, `${validPayload.phone}.json`),
          rename('orders', phone, body.phone)
        ]);
      } catch (err) { // if rename fails - set the phone to one from queryParams
        console.log('Error renaming file!', err);
        validPayload.phone = phone;
      }
    };
    try {
      await updateFile('users', `${validPayload.phone}.json`, validPayload);
      return {result: validPayload, statusCode: 200};
    } catch (err) {
      console.log(err);
      return {result: 'User not found!', statusCode: 404};
    }
  }
  return {result: 'Unauthenticated!', statusCode: 403};
};

const _delete = async ({ queryParams, token }) => {
  const { phone } = queryParams;
  const tokenVerified = await verifyToken(token, phone);
  if (tokenVerified) {
    try {
      await Promise.all([
        deleteFile('users', `${phone}.json`),
        deleteFile('orders', phone)
      ]);
      return {result: 'File deleted successfully!', statusCode: 200};
    } catch (err) {
      console.log(err);
      return {result: 'User not found!', statusCode: 404};
    }
  }
  return {result: 'Unauthenticated!', statusCode: 403};
};

module.exports = { _get, _post, _put, _delete };