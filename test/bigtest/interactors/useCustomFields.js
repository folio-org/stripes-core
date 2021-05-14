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
