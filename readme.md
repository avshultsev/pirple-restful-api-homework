## Usage
**1. Creating a user profile.**
method: `POST`;
endpoint: `/users`;
payload: { 'firstName', 'lastName', 'password', 'phone', cardInfo: { 'number', 'exp_month', 'exp_year', 'cvc' } };
**2. Create user cart.**
method: `POST`;
endpoint: `/cart/{userPhone}`;
payload: `null`;
**3. Create user orders collection.** #mkdir
method: `POST`;
endpoint: `/orders/{userPhone}`;
payload: `null`;
**4. Updating user cart.**
method: `PUT`;
endpoint: `/cart/{userPhone}`;
payload: { 'itemName', 'itemPrice', 'itemSize' };
**5. Create order.** #touch
method: `POST`;
endpoint: `/orders/{userPhone}/{orderID}`;
payload: `GET` to `/cart/{userPhone}` + check for available cards;

if (user.cardInfo ===  `undefined`) {
  **1. Create a token for the card**
  **2. Create a card by this token**
  **3. Update user both in Stripe and user profile with new card info (cardID)**
}

**6. Make a charge**
Use Stripe API to make charge. 
Use: **cardID** (+ associated customer ID) or **cardToken**