import {
  interactor,
  scoped,
  property
} from '@bigtest/interactor';
import MessageBannerInteractor from '@folio/stripes-components/lib/MessageBanner/tests/interactor';

@interactor class LoginInteractor {
  username = scoped('input[name="username"]');
  password = scoped('input[name="password"]');
  forgotPassword = scoped('[data-test-new-forgot-password-link]');
  forgotUsername = scoped('[data-test-new-forgot-username-link]');
  message = new MessageBannerInteractor();
  submit = scoped('button[type="submit"]', {
    isDisabled: property('disabled')
  });
}

export default LoginInteractor;
