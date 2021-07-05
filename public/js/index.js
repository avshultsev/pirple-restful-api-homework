import { getToken, setBodyLoginClass } from './lib.js';
import processLoginForm from './processLoginForm.js'

const setLoginStatus = () => {
  const tokenObj = getToken();
  setBodyLoginClass(tokenObj);
};

window.onload = () => {
  processLoginForm();
  setLoginStatus();
};