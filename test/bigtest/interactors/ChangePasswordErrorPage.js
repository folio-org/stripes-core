import {
  interactor,
  scoped,
} from '@bigtest/interactor';

@interactor
class ChangePasswordErrorPageInteractor {
  static defaultScope = ('[data-test-change-password-error]');

  message = scoped('[data-test-message]');
}

export default ChangePasswordErrorPageInteractor;
