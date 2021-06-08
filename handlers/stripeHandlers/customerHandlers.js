const { createOptions } = require("../../lib/stripe");
const { request } = require("../../lib/utils");

// @TODO: add to array of required when creating new user ['card_number', 'exp_month', 'exp_year', 'cvc'] 
// @TODO: add full crud for customers as we suppose user info can be modified/deleted/...etc
const createCustomer = async ({ name = '', cardToken = 'visa', phone = '' }) => {
  const payload = { name, cardToken, phone };
  const strPayload = new URLSearchParams(payload).toString();
  const options = createOptions('post', 'customers', strPayload);
  try {
    const customer = await request(options, strPayload);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const retreiveCustomer = async (customerID = '') => {
  const options = createOptions('get', `customers/${customerID}`);
  try {
    const customer = await request(options);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const updateCustomer = async (customerID = '', payload = {}) => {
  const strPayload = new URLSearchParams(payload).toString();
  const options = createOptions('post', `customers/${customerID}`, strPayload);
  try {
    const customer = await request(options, strPayload);
    return customer;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteCustomer = async (customerID = '') => {
  const options = createOptions('delete', `customers/${customerID}`);
  try {
    const { id, deleted } = await request(options);
    return { id, deleted };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createCustomer, retreiveCustomer, updateCustomer, deleteCustomer };