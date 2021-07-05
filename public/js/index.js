import { getToken, setBodyLoginClass, setupLogoutButton } from './lib.js';
import processLoginForm from './processLoginForm.js'

const setLoginStatus = () => {
  const tokenObj = getToken();
  setBodyLoginClass(tokenObj);
  setupLogoutButton();
};

const initMaterializeModals = () => {
  const elems = document.querySelectorAll('.modal');
  const instances = M.Modal.init(elems, {});
};
document.addEventListener('DOMContentLoaded', initMaterializeModals);

window.onload = () => {
  processLoginForm();
  setLoginStatus();
};