import {
  describe,
  it,
  beforeEach
} from 'mocha';

import { TextField, Bigtest, HTML, including } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-core-application';
import always from '../helpers/always';

import translations from '../../../translations/stripes-core/en';

const ErrorMessage = HTML.extend('message banner')
  .selector('[data-test-message-banner]');

describe('Login', () => {
  const { Link, Button: LoginButton } = Bigtest;
  const usernamefield = TextField({ id: 'input-username' });
  const passwordfield = TextField({ id: 'input-password' });
  const loginButton = LoginButton('Log in');
  const loginDisabled = () => LoginButton({ text: 'Log in', disabled: true }).exists();

  const loginAction = async () => {
    await usernamefield.fillIn('username');
    await passwordfield.fillIn('password');
    await loginButton.click();
  };

  setupApplication({ disableAuth: false });

  describe('default behavior', () => {
    it('should have username field', () => usernamefield.exists());

    it('should have password field', () => passwordfield.exists());

    it('should have forgot password link', () => Link('Forgot password?').exists());

    it('should have forgot username link', () => Link('Forgot username?').exists());

    it('submit button should be disabled', loginDisabled);

    it('error message should not be present', always(() => ErrorMessage().absent()));
  });

  describe('username insertion', () => {
    beforeEach(async () => {
      await usernamefield.fillIn('test');
    });

    it('submit button should be active', () => loginButton.is({ disabled: false }));

    it('error message should not be present', always(() => ErrorMessage().absent()));
  });

  describe('password insertion', () => {
    beforeEach(async () => {
      await passwordfield.fillIn('test');
    });

    it('submit button should be disabled', loginDisabled);

    it('error message should not be present', always(() => ErrorMessage().absent()));
  });

  describe('errors', () => {
    describe('error for the wrong username', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['wrongUsername'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.username.incorrect']).exists());
    });

    describe('error for the wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['wrongPassword'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.password.incorrect']).exists());
    });

    describe('error for the server error', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['serverError'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.default.server.error']).exists());
    });

    describe('error for the third attempt to enter wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['thirdAttemptToLogin'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.password.incorrect.warn.user']).exists());
    });

    describe('error for the fifth attempt to enter wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['fifthAttemptToLogin'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.password.incorrect.block.user']));
    });

    describe('error for the attempt to login to locked account', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['lockedAccount'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.user.blocked']));
    });

    describe('multiple errors', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['multipleErrors'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => {
        const res = [
          ErrorMessage(including(translations['errors.user.blocked'])).exists(),
          ErrorMessage(including(translations['errors.password.incorrect.warn.user'])).exists()
        ];
        return Promise.all(res);
      });
    });

    describe('invalid response body', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['invalidResponseBody'],
      });

      beforeEach(loginAction);

      it('username should not be reset upon failed submit', always(() => usernamefield.has({ value: 'username' })));

      it('password should be reset upon failed submit', () => passwordfield.has({ value: '' }));

      it('error message should have proper text upon failed submit', () => ErrorMessage(translations['errors.default.error']).exists());
    });

    describe('with valid credentials', () => {
      beforeEach(async () => {
        await loginAction();
        await loginButton.blur();
      });

      it('login page should not be displayed upon successful login', () => usernamefield.absent());
    });
  });
});
