import { interactor, scoped, property } from '@bigtest/interactor';

export default @interactor class LoginInteractor {
  username = scoped('input[name="username"]');
  password = scoped('input[name="password"]');
  submit = scoped('button[type="submit"]', {
    isDisabled: property('disabled')
  });

  message = scoped('div[class^="formMessage--"]')
}
