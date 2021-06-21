const { createStripeOptions } = require('../../lib/api.js');
const { request } = require('../../lib/utils.js');

const chargeCard = async (customer = '', amount = 0) => {
  const payload = { amount: amount * 100, currency: 'usd', customer };
  const strPayload = new URLSearchParams(payload).toString();
  const options = createStripeOptions('post', 'charges', strPayload);
  try {
    const charge = await request(options, strPayload);
    return charge;
  } catch (err) {
    throw err;
  }
};

module.exports = { chargeCard };