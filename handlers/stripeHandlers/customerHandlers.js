const { createStripeOptions } = require("../../lib/api.js");
const { request } = require("../../lib/utils");

const createCustomer = async (payload = { name: '', phone: '' }) => {
  const strPayload = new URLSearchParams(payload).toString();
  const options = createStripeOptions('post', 'customers', strPayload);
  try {
    const customer = await request(options, strPayload);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const retreiveCustomer = async (customerID = '') => {
  const options = createStripeOptions('get', `customers/${customerID}`);
  try {
    const customer = await request(options);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const updateCustomer = async (customerID = '', payload = {}) => {
  const strPayload = new URLSearchParams(payload).toString();
  const options = createStripeOptions('post', `customers/${customerID}`, strPayload);
  try {
    const customer = await request(options, strPayload);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteCustomer = async (customerID = '') => {
  const options = createStripeOptions('delete', `customers/${customerID}`);
  try {
    const { id, deleted } = await request(options);
    return { id, deleted };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createCustomer, retreiveCustomer, updateCustomer, deleteCustomer };