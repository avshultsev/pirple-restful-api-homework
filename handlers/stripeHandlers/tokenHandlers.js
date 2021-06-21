const { createStripeOptions } = require('../../lib/api.js')
const { request } = require('../../lib/utils.js');

// createToken => POST /v1/tokens
const createCardToken = async (cardInfo = {number: '', exp_month: '', exp_year: '', cvc: ''}) => {
  const card = {};
  Object.keys(cardInfo).forEach(key => {
    card[`card[${key}]`] = cardInfo[key];
  });
  const strPayload = new URLSearchParams(card).toString();
  const options = createStripeOptions('post', 'tokens', strPayload);
  try {
    const token = await request(options, strPayload);
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

// getToken => GET /v1/tokens/:tokenID
const retreiveCardToken = async (tokenID) => {
  const options = createStripeOptions('get', `tokens/${tokenID}`);
  try {
    const token = await request(options);
    return token;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createCardToken, retreiveCardToken };