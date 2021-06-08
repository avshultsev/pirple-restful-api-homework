const { createOptions } = require('../../lib/stripe.js')
const { request } = require('../../lib/utils.js');

// createToken => POST /v1/tokens
const createCardToken = async (number = '', exp_month = 0, exp_year = 0, cvc = 0) => {
  const card = { number, exp_month, exp_year, cvc };
  const strPayload = new URLSearchParams(card).toString();
  const options = createOptions('post', 'tokens', strPayload);
  try {
    const token = await request(options, strPayload);
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

// getToken => GET /v1/tokens/:tokenID
const retreiveCardToken = async (tokenID) => {
  const options = createOptions('get', `tokens/${tokenID}`);
  try {
    const token = await request(options);
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createCardToken, retreiveCardToken };