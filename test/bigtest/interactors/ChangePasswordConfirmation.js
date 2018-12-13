import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class ChangePasswordConfirmationInteractor {
  static defaultScope = ('[data-test-change-password-confirmation]');
  heading = scoped('[data-test-h1]');
  message = scoped('[data-test-message]');
}

export default ChangePasswordConfirmationInteractor;
