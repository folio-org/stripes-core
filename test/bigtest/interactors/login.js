import { interactor, scoped, property } from '@bigtest/interactor';

@interactor class LoginInteractor {
  username = scoped('input[name="username"]');
  password = scoped('input[name="password"]');
  forgotPassword = scoped('[data-test-new-forgot-password-link]');
  message = scoped('div[class^="AuthErrorsContainer--"]');
  submit = scoped('button[type="submit"]', {
    isDisabled: property('disabled')
  });
}

export default LoginInteractor;
