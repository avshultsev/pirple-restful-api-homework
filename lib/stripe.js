const { SECRET_KEY } = require('../secrets.js');

const createOptions = (method = 'get', endpoint = '', strPayload = '') => {
  const options = {
    'protocol': 'https:',
    'hostname': 'api.stripe.com',
    'method': method.toUpperCase(),
    'path': `/v1/${endpoint}`,
    'headers': {
      'Authorization': `Bearer ${SECRET_KEY}`,
    },
  };
  if (strPayload) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers['Content-Length'] = Buffer.byteLength(strPayload);
  };
  return options;
};

module.exports = { createOptions };