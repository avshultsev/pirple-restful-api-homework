const { createFile, deleteFile, listItems, readFile, updateFile, rename } = require('../lib/crud.js');
const { validatePayload } = require('../lib/utils.js');

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

const _post = async ({ body }) => {
  const required = ['name', 'prices', 'sizes'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return {result: 'Missing required fields!', statusCode: 400};
  const { name } = validPayload;
  try {
    await createFile('items', `${name}.json`, validPayload);
    return {result: 'Item successfully added!', statusCode: 200};
  } catch (err) {
    return {result: 'Item with such name already exists!', statusCode: 400};
  }
};

const _put = async ({ body, queryParams }) => {
  const required = ['name', 'prices', 'sizes'];
  const validPayload = validatePayload(required, body);
  if (!validPayload) return {result: 'Missing required fields!', statusCode: 400};
  const { name: oldName } = queryParams;
  const { name: newName } = validPayload;
  if (oldName !== newName) {
    try {
      await rename('items', oldName, newName);
    } catch (err) {
      console.log(err);
      return {result: 'Error renaming item!', statusCode: 500};
    }
  }
  try {
    await updateFile('items', `${newName}.json`, validPayload);
    return {result: 'Item updated successfully!', statusCode: 200};
  } catch (err) {
    console.log(err);
    return {result: 'Item not found!', statusCode: 404};
  }
};

const _delete = async ({ queryParams }) => {
  const { name } = queryParams;
  try {
    await deleteFile('items', `${name}.json`);
    return {result: 'Item successfully deleted!', statusCode: 200};
  } catch (err) {
    return {result: 'Item not found!', statusCode: 404};
  }
};

module.exports = { _get, _post, _put, _delete };