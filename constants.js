const MIN_PHONE_NUMBER_LENGTH = 7;
const TOKEN_LENGTH = 20;
const TOKEN_VALIDITY_TIME = 60 * 60 * 1000; // 1 hour in ms
const ORDER_ID_LENGTH = 10;
const MAILGUN_PAYLOAD_BOUNDARY = 'break';
const MAILGUN_DOMAIN = 'sandbox8473f7b46ef342779f589c0072088556.mailgun.org';

module.exports = {
  MIN_PHONE_NUMBER_LENGTH,
  TOKEN_LENGTH,
  TOKEN_VALIDITY_TIME,
  ORDER_ID_LENGTH,
  MAILGUN_PAYLOAD_BOUNDARY,
  MAILGUN_DOMAIN,
};