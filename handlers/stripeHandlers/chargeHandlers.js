const { request } = require('../../lib/utils.js');
const { createOptions } = require('../../lib/stripe.js');

const chargeCard = async (customer = '', amount = 0) => {
  const payload = { amount: amount * 100, currency: 'usd', customer };
  const strPayload = new URLSearchParams(payload).toString();
  const options = createOptions('post', 'charges', strPayload);
  try {
    const charge = await request(options, strPayload);
    return charge;
  } catch (err) {
    throw err;
  }
};

module.exports = { chargeCard };