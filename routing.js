const userHandlers  = require('./handlers/userHandlers.js');
const itemHandlers  = require('./handlers/itemHandlers.js');
const tokenHandlers = require('./handlers/tokenHandlers.js');
const cartHandlers  = require('./handlers/cartHandlers.js');
const orderHandlers = require('./handlers/orderHandlers.js');

module.exports = {
  '/': {
    get: async () => 'Welcome to the main page!',
  },
  '/api/users' : userHandlers,
  '/api/tokens': tokenHandlers,
  '/api/items' : itemHandlers,
  '/api/cart'  : cartHandlers,
  '/api/orders': orderHandlers,
};