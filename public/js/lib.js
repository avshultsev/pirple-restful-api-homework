const HOST = 'http://localhost:3000';

export const VALIDATORS = {
  'tel': (value) => ((/\D/).test(value) || value.length < 7),
  'password': (value) => (value.length < 6),
  'text': (value) => !value.trim(),
  'email': (value) => !(/\w+@\w+\.\w{2,}/).test(value),
};

export const setBodyLoginClass = (isLoggedIn) => {
  const body = document.querySelector('body');
  if (isLoggedIn) {
    body.classList.remove('logout');
    body.classList.add('login');
    return;
  };
  body.classList.remove('login');
  body.classList.add('logout');
};

export const showError = (formID, result) => {
  const errDiv = document.querySelector(`form#${formID}>div.row.error`);
  const cross = errDiv.querySelector('i.material-icons');
  cross.addEventListener('click', () => {
    errDiv.classList.add('hidden');
  });
  const textField = errDiv.querySelector('p.error-text');
  textField.innerHTML = result;
  errDiv.classList.remove('hidden');
};

export const getToken = () => {
  const tokenStr = localStorage.getItem('token');
  return tokenStr ? JSON.parse(tokenStr) : '';
};

export const setToken = (tokenObj) => {
  localStorage.setItem('token', JSON.stringify(tokenObj));
};

export const request = async (path = HOST, method = 'GET', payload = {}, queryObj = {}, headers = {}) => {
  const queryStr = Object.keys(queryObj).reduce((acc, key, i, arr) => {
    acc += `${key}=${queryObj[key]}`
    if (i !== arr.length - 1) acc += '&';
    return acc;
  }, '');
  const url = path + (queryStr && ('?' + queryStr));
  method = method.toUpperCase();
  const init = { headers, method };
  const tokenObj = getToken();

  if (tokenObj) init.headers.token = tokenObj.token;
  if (method === 'PUT' || method === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(payload);
  }
  try {
    const response = await fetch(url, init);
    return response;
  } catch (err) {
    console.log(err);
  }
};