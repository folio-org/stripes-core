import { clickable, fillable, interactor, isVisible, text } from '@bigtest/interactor';

@interactor class UseCustomFieldsInteractor {
  fillUsername = fillable('#input-username');
  fillPassword = fillable('#input-password');
  clickLogin = clickable('#clickable-login');
  clickProfileDropdown = clickable('#profileDropdown');
  clickLogout = clickable('#clickable-logout');


  hasError = isVisible('#error');
  isLoading = isVisible('#loading');
  hasCustomFields = isVisible('#custom-fields li');
  customFields = text('#custom-fields');
}

export default UseCustomFieldsInteractor;

const UseCustomFieldsInteractor = HTML.extend('UseCustomField')
  .selector('body')
  .filters({
    errorShown: el => Boolean(el.querySelector('#error')),
    loading: el => Boolean(el.querySelector('#loading')),
    customFields: el => Boolean(el.querySelector('#custom-fields li')),
    customFields: el =>  el.querySelector('#custom-fields')?.innerText,
  })
  .actions ({
    fillUserName: ({find}, value) => { find(TextField({ id: 'input-username' }).fill(value))},
    fillPassword: ({find}, value) => { find(TextField({ id: 'input-password' }).fill(value))},
    clickLogin: ({find}) => {find(Button({ id: 'clickable-login' })).click()},
    clickProfileDropdown: ({find}) => {find(Button({ id: 'profileDropdown' })).click()},
    clickLogout: ({find}) => {find(Button({ id: 'clickable-logout' })).click()},
  });