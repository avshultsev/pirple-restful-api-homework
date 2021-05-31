const MIN_PHONE_NUMBER_LENGTH = 7;
const TOKEN_LENGTH = 20;
const TOKEN_VALIDITY_TIME = 60 * 60 * 1000; // 1 hour in ms
const SECRET = 'MyVerySecretValue';

module.exports = {
  MIN_PHONE_NUMBER_LENGTH,
  TOKEN_LENGTH,
  TOKEN_VALIDITY_TIME,
  SECRET,
};