const { createStripeOptions } = require("../../lib/api.js");
const { request } = require("../../lib/utils");

const createCard = async (customerID, cardToken) => {
  const strPayload = new URLSearchParams({ source: cardToken }).toString();
  const options = createStripeOptions('post', `customers/${customerID}/sources`, strPayload);
  try {
    const card = await request(options, strPayload);
    return card;
  } catch (err) {
    throw new Error(err);
  }
};

const retreiveCard = async (customerID, cardID) => {
  const options = createStripeOptions('get', `customers/${customerID}/sources/${cardID}`);
  try {
    const card = await request(options);
    return card;
  } catch (err) {
    throw new Error(err);
  }
};

const updateCard = async (customerID, cardID, payload = {}) => {
  const strPayload = new URLSearchParams(payload).toString();
  const options = createStripeOptions('post', `customers/${customerID}/sources/${cardID}`, strPayload);
  try {
    const card = await request(options, strPayload);
    return card;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteCard = async (customerID, cardID) => {
  const options = createStripeOptions('delete', `customers/${customerID}/sources/${cardID}`);
  try {
    const { id, deleted } = await request(options);
    return { id, deleted };
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = { createCard, retreiveCard, updateCard, deleteCard };