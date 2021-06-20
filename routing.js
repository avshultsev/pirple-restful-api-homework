const userHandlers  = require('./handlers/userHandlers.js');
const itemHandlers  = require('./handlers/itemHandlers.js');
const tokenHandlers = require('./handlers/tokenHandlers.js');
const cartHandlers  = require('./handlers/cartHandlers.js');
const orderHandlers = require('./handlers/orderHandlers.js');

module.exports = {
  '/': {
    get: async () => 'Welcome to the main page!',
  },
  '/users': {
    get:    userHandlers._get,
    post:   userHandlers._post,
    put:    userHandlers._put,
    delete: userHandlers._delete,
  },
  '/tokens': {
    get:    tokenHandlers._get,
    post:   tokenHandlers._post,
    put:    tokenHandlers._put,
    delete: tokenHandlers._delete,
  },
  '/items': {
    get:    itemHandlers._get,
  },
  '/cart': {
    get:    cartHandlers._get,
    post:   cartHandlers._post,
    put:    cartHandlers._put,
    delete: cartHandlers._delete,
  },
  '/orders': {
    get:    orderHandlers._get,
    post:   orderHandlers._post,
    put:    orderHandlers._put,
    delete: orderHandlers._delete,
  },  
};