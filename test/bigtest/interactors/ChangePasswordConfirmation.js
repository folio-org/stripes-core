import {
  interactor,
  scoped,
  clickable,
} from '@bigtest/interactor';

@interactor
class RedirectToLogin {
    clickContinue = clickable('button');
}

@interactor
class ChangePasswordConfirmationInteractor {
  static defaultScope = ('[data-test-change-password-confirmation]');
  heading = scoped('[data-test-h1]');
  message = scoped('[data-test-message]');

  redirect = new RedirectToLogin('[data-test-redirect]');
}

export default ChangePasswordConfirmationInteractor;
