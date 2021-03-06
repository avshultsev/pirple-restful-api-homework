## Usage
### Creating a user profile
```
{
  method: `POST`;
  endpoint: `/users`;
  payload: { 
    'firstName', 
    'lastName', 
    'password', 
    'phone', 
    'cardInfo': { 'number', 'exp_month', 'exp_year', 'cvc' } };
}
```
### Create user cart
```
{
  method: `POST`;
  endpoint: `/cart/{userPhone}`;
  payload: `null`;
}
```
### Updating user cart
```
{
  method: `PUT`;
  endpoint: `/cart/{userPhone}`;
  payload: { 'itemName', 'itemPrice', 'itemSize' };
}
```
### Create order
if (!userPhoneDir) mkdir('orders', '{userPhone}');
```
{
  method: `POST`;
  endpoint: `/orders/{userPhone}`;
  payload: `GET` to `/cart/{userPhone}` + check for available cards;
}
```

if (user.cardInfo ===  `undefined`) 
  - Create a token for the card.
  - Create a card by this token.
  - Update user both in Stripe and user profile with new card info (cardID).


### Make a charge
Use Stripe API to make charge. 
Use: **cardID** (+ associated **customer ID**) or **cardToken**