const { createMailgunOptions } = require('../../lib/api.js');
const { request } = require('../../lib/utils.js');
const { MAILGUN_DOMAIN: DOMAIN, MAILGUN_PAYLOAD_BOUNDARY: BOUNDARY } = require('../../constants.js');

const sendEmail = async (order = { items: [], total: 0 }, user = {email: '', address: ''}) => {
  const options = createMailgunOptions();
  const items = [];
  order.items.forEach(({ name, size }) => {
    items.push(`pizza ${name} with size of ${size}`);
  });
  const data = {
    from: `BestPizzaDelivery <mailgun@${DOMAIN}>`,
    to: user.email,
    subject: 'Your order has been accepted!',
    text: `Your order for ${items.join(', ')} with a total cost of $${order.total} is already on its' way to ${user.address}!`,
  };
  const boundaryMiddle = `--${BOUNDARY}\n`;
  const boundaryLast = `--${BOUNDARY}--\n`;
  let body = ['\n'];
  for (const key in data) {
    body.push(`Content-Disposition: form-data; name="${key}"\n\n${data[key]}\n`);
  }
  body = body.join(boundaryMiddle) + boundaryLast;
  try {
    const response = await request(options, body);
    if (!response.id) throw new Error('Invalid request info!');
    return response;
  } catch (err) {
    throw err;
  }
};

module.exports = { sendEmail };