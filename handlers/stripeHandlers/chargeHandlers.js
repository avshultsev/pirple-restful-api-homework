// charge card
const chargeCard = async (amount = 0, cardToken = 'visa') => {
  const payload = {
    amount,
    currency: 'usd',
    source: `tok_${cardToken}`,
  };
  const strPayload = new URLSearchParams(payload).toString();
  const options = createOptions('post', 'charges', strPayload);
  try {
    const charge = await request(options, strPayload);
    return charge;
  } catch (err) {
    throw new Error;
  }
};