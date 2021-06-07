const { receiveArgs, promisifiedRequest: request } = require('./utils.js');
const { ACCOUNT_ID } = require('../constants.js');
const { SECRET_KEY } = require('../secrets.js');

const createOptions = (strPayload = '', method = 'get', endpoint = '') => {
  const options = {
    'protocol': 'https:',
    'hostname': 'api.stripe.com',
    'method': method.toUpperCase(),
    'path': `/v1/${endpoint}`,
    'headers': {
      'Authorization': `Bearer ${SECRET_KEY}`,
      'Stripe-Account': ACCOUNT_ID, // probably has to be removed
    },
  };
  if (strPayload) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = Buffer.byteLength(strPayload);
  };
  return options;
};

// @TODO: add to array of required when creating new user ['card_number', 'exp_month', 'exp_year', 'cvc'] 
// @TODO: add full crud for customers as we suppose user info can be modified/deleted/...etc
const createCustomer = async (name = '', cardToken = 'visa') => {
  const strPayload = new URLSearchParams({ name, source: `tok_${cardToken}` }).toString();
  const options = createOptions(strPayload, 'post', 'customers');
  try {
    const customer = await request(options, strPayload);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const chargeCard = async (amount = 0, cardToken = 'visa') => {
  const payload = {
    amount,
    currency: 'usd',
    source: `tok_${cardToken}`,
  };
  const strPayload = new URLSearchParams(payload).toString();
  const options = createOptions(strPayload, 'post', 'charges');
  try {
    const charge = await request(options, strPayload);
    return charge;
  } catch (err) {
    throw new Error;
  }
};

module.exports = { createCustomer, chargeCard };