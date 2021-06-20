const { listItems, readFile } = require('../lib/crud.js');

const _get = async () => {
  try {
    const items = await listItems('items');
    const readItem = item => readFile('items', `${item}.json`);
    const promises = items.map(readItem);
    const populatedItems = await Promise.all(promises);
    return {result: populatedItems, statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: 'Server error!', statusCode: 500};
  }
};

module.exports = { _get, _post, _put, _delete };