/* FOR:
"/account/create"
"/session/create"  
*/
import { request, setToken, showError, VALIDATORS } from './lib.js';

const blurHandler = (element) => {
  const { type, value } = element;
  const validator = VALIDATORS[type];
  const isInvalid = type === 'text' ?
    validator(value) :
    validator(value) && validator('text'); // inputs with non-text types has to be checked for value emptiness

  if (isInvalid) {
    element.classList.remove('valid');
    element.classList.add('invalid');
  } else {
    element.classList.remove('invalid');
    element.classList.add('valid');
  }
};

const submitLoginForm = (form, e) => {
  e.preventDefault();
  const { elements, action, method, id } = form;
  const payload = {};
  for (const element of elements) {
    const { value, type, name } = element;
    if (type === 'submit') continue;
    payload[name] = value;
  }
  request(action, method.toUpperCase(), payload)
    .then(res => res.json())
    .then(({ result, statusCode }) => {
      if (statusCode !== 200) {
        return showError(id, result);
      };
      if (result.token) setToken(result);
      window.location = '/';
    })
    .catch(console.log);
};

const processLoginForm = () => {
  const form = document.querySelector('form.login');
  if (form) {
    const { elements } = form;
    for (const element of elements) {
      if (element.type === 'submit') continue;
      element.addEventListener('blur', blurHandler.bind(null, element));
    };
    form.addEventListener('submit', submitLoginForm.bind(null, form));
  }
};

export default processLoginForm;