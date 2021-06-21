const { SECRET_STRIPE_KEY, MAILGUN_API_KEY } = require('../secrets.js');
const { MAILGUN_DOMAIN, MAILGUN_PAYLOAD_BOUNDARY } = require('../constants.js');

const createStripeOptions = (method = 'get', endpoint = '', strPayload = '') => {
  const options = {
    'protocol': 'https:',
    'hostname': 'api.stripe.com',
    'method': method.toUpperCase(),
    'path': `/v1/${endpoint}`,
    'headers': {
      'Authorization': `Bearer ${SECRET_STRIPE_KEY}`,
    },
  };
  if (strPayload) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = Buffer.byteLength(strPayload);
  };
  return options;
};

const createMailgunOptions = () => {
  const auth = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
  const options = {
    'protocol': 'https:',
    'hostname': 'api.mailgun.net',
    'method': 'POST',
    'path': `/v3/${MAILGUN_DOMAIN}/messages`,
    'headers': {
      'Authorization': `Basic ${auth}`,
      'Content-Type': `multipart/form-data; boundary=${MAILGUN_PAYLOAD_BOUNDARY}`,
    }
  };
  return options;
};

module.exports = { createStripeOptions, createMailgunOptions };