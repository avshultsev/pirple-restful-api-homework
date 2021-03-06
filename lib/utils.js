const crypto = require('crypto');
const https = require('https');
const { SECRET } = require('../secrets.js');

const receiveArgs = async (asyncIterable) => {
  const chunks = [];
  for await (const chunk of asyncIterable) chunks.push(chunk);
  const data = Buffer.concat(chunks).toString();
  return JSON.parse(data);
};

const toHash = str => {
  const hashedPassword = crypto
    .createHmac('sha256', SECRET)
    .update(str)
    .digest('hex');
  return hashedPassword;
};

const createRandomString = length => {
  const LOWERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE_ALPHABET = LOWERCASE_ALPHABET.toUpperCase();
  const DIGITS = '1234567890';
  const ALPHA_DIGIT = LOWERCASE_ALPHABET + UPPERCASE_ALPHABET + DIGITS;
  const ALPHA_DIGIT_LENGTH = ALPHA_DIGIT.length;
  let str = '';
  while (str.length < length) {
    const index = Math.round(Math.random() * ALPHA_DIGIT_LENGTH);
    str += ALPHA_DIGIT[index];
  };
  return str;
};

const validatePayload = (requiredFields = [], payload = {}) => {
  const objOfRequired = {};
  for (const prop of requiredFields) {
    const value = payload[prop];
    if (!value) return false;
    objOfRequired[prop] = value;
  }
  return objOfRequired;
};

const request = (options = {}, strPayload = '') => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, async (res) => {
      const response = await receiveArgs(res);
      resolve(response);
    });
    req
      .on('error', reject)
      .on('timeout', reject);
    if (strPayload) req.write(strPayload);
    req.end();
  });
};

module.exports = { toHash, createRandomString, validatePayload, receiveArgs, request };