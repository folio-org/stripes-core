import { expect } from 'chai';

import {
  describe,
  it,
  beforeEach,
} from 'mocha';

import {
  TextField,
  HTML,
  Bigtest,
  Button,
} from '@folio/stripes-testing';

import setupApplication from '../helpers/setup-core-application';
import always from '../helpers/always';
// import CreateResetPasswordInteractor from '../interactors/CreateResetPassword';
import ChangePasswordErrorPageInteractor from '../interactors/ChangePasswordErrorPage';
// import ChangePasswordConfirmationInteractor from '../interactors/ChangePasswordConfirmation';
import { Login as LoginInteractor } from '../interactors/common';

import translations from '../../../translations/stripes-core/en';

const labelInteractor = HTML.extend('label')
  .selector('label')
  .filters({
    for: el => el.htmlFor
  });

const CreateResetPasswordInteractor = HTML.extend('create/reset password form')
  .selector('form[class^="form--"]')
  .filters({
    error: el => el.querySelector('[data-test-message-banner]') !== null,
    errorText: el => el.querySelector('[data-test-message-banner]')?.innerText || '',
    newPasswordLabel: el => el.querySelectorAll('label')[0].textContent,
    newPasswordValue: el => el.querySelector('#new-password').value,
    newPasswordType: el => el.querySelector('#new-password').type,
    confirmPasswordLabel: el => el.querySelectorAll('label')[1].textContent,
    confirmPasswordValue: el => el.querySelector('#confirm-password').value,
    confirmPasswordType: el => el.querySelector('#confirm-password').type,
  })
  .actions({
    async fillIn({ find }, values) {
      await find(TextField({ id: 'new-password' })).fillIn(values.newPassword);
      await find(TextField({ id: 'confirm-password' })).fillIn(values.confirmPassword);
    },
    clickShowPassword: ({ find }) => find(Button(translations['button.showPassword'])).click(),
    clickHidePassword: ({ find }) => find(Button(translations['button.hidePassword'])).click(),
    clickSubmit: ({ find }) => find(Button({ text: translations.setPassword, disabled: false })).click(),
  });

const ChangePasswordErrorInteractor = HTML.extend('change password confirmation')
  .selector('[data-test-change-password-error]')
  .filters({
    errorText: el => el.querySelector('[data-test-message]').innerText,
  });

const ChangePasswordConfirmationInteractor = HTML.extend('change password confirmation')
  .selector('[data-test-change-password-confirmation]')
  .filters({
    heading: (el) => el.querySelector('h1').innerText,
    errorText: el => el.querySelector('[data-test-message]').innerText,
  })
  .actions({
    clickContinue: ({ find }) => find(Button('Continue to FOLIO')).click()
  });

describe.only('Create/Reset password page', () => {
  const CreateResetPasswordPage = CreateResetPasswordInteractor();
  const newPasswordField = TextField({ type: 'password', id: 'new-password' });
  const confirmPasswordField = TextField({ type: 'password', id: 'confirm-password' });

  setupApplication({
    disableAuth: false,
    scenarios: ['passwordLengthRule'],
  });

  describe('valid token scenario', () => {
    beforeEach(function () {
      return this.visit({
        pathname: '/reset-password/test',
      }, () => CreateResetPasswordPage.exists());
    });

    describe('default behavior', () => {
      describe('new password field', () => {
        it('should have a [type=password] field for new password', () => CreateResetPasswordPage.has({ newPasswordType: 'password' }));

        it('should contain a proper label for the new password field', () => labelInteractor({ text: translations['createResetPassword.newPassword'], for: 'new-password' }));
      });

      describe('confirm password field', () => {
        it('should have a [type=password] field for confirm password', () => CreateResetPasswordPage.has({ confirmPasswordType: 'password' }));

        it('should contain a proper label for the confirm password field', () => labelInteractor({ text: translations['createResetPassword.confirmPassword'], for: 'confirm-password' }));
      });

      describe('toggle mask button', () => {
        it('should be presented', () => Button(translations['button.showPassword']).exists());
      });

      describe('submit button', () => {
        it('should be present', () => Button({ text: translations.setPassword, disabled: true }).exists());

        describe('error message', () => {
          it('should not be presented', always(() => CreateResetPasswordPage.has({ error: false })));
        });
      });

      describe('same passwords insertion', () => {
        beforeEach(async () => {
          await CreateResetPasswordPage.fillIn({ newPassword: 'test', confirmPassword: 'test' });
        });

        describe('new password field', () => {
          it('should be presented', always(() => newPasswordField.exists()));

          it('should have proper label', always(() => CreateResetPasswordPage.has({ newPasswordLabel: translations['createResetPassword.newPassword'] })));

          it('should have inserted password', () => CreateResetPasswordPage.has({ newPasswordValue: 'test' }));
        });

        describe('confirm password field', () => {
          it('should be presented', always(() => confirmPasswordField.exists()));

          it('should have proper label', always(() => CreateResetPasswordPage.has({ confirmPasswordLabel: translations['createResetPassword.newPassword'] })));

          it('should have inserted password', () => CreateResetPasswordPage.has({ confirmPasswordValue: 'test' }));
        });

        describe('toggle mask button', () => {
          describe('toggle mask from password to text', () => {
            beforeEach(async () => {
              await CreateResetPasswordPage.clickShowPassword();
            });

            it('checks toggled button text', () => Button(translations['button.hidePassword']).exists());

            it('changes the type of the confirm password field to text', () => CreateResetPasswordPage.has({ confirmPasswordType: 'text' }));

            it('changes the type of the new password field to text', () => CreateResetPasswordPage.has({ newPasswordType: 'text' }));

            describe('toggle mask from text to password', () => {
              beforeEach(async () => {
                await CreateResetPasswordPage.clickHidePassword();
              });

              it('checks toggled button text', () => Button(translations['button.showPassword']).exists());

              it('changes the type of the confirm password field to text', () => CreateResetPasswordPage.has({ confirmPasswordType: 'password' }));

              it('changes the type of the new password field to text', () => CreateResetPasswordPage.has({ confirmPasswordType: 'password' }));
            });
          });
        });

        describe('submit button', () => {
          it('should be active', always(() => Button({ text: translations.setPassword, disabled: false })));

          describe('error message', () => {
            it('should not be presented', always(() => CreateResetPasswordPage.has({ error: false })));
          });
        });
      });

      describe('different passwords insertion', () => {
        beforeEach(async () => {
          await CreateResetPasswordPage.fillIn({ newPassword: 'test-test', confirmPassword: 'test' });
        });

        describe('new password field', () => {
          it('should have inserted password', () => CreateResetPasswordPage.has({ newPasswordValue: 'test-test' }));
        });

        describe('confirm password field', () => {
          it('should have inserted password', () => CreateResetPasswordPage.has({ confirmPasswordValue: 'test' }));
        });

        describe('submit button', () => {
          it('should be disabled', always(() => Button({ text: translations.setPassword, disabled: true }).exists()));

          describe('error message', () => {
            it('should present error message', () => CreateResetPasswordPage.has({ error: true }));
          });
        });
      });
    });

    describe('successful submission', () => {
      const confirmation = new ChangePasswordConfirmationInteractor();

      setupApplication({
        disableAuth: false,
        scenarios: [
          'passwordLengthRule',
          'changePasswordSuccess'
        ],
      });

      beforeEach(async function () {
        await this.visit('/reset-password/test');
        await CreateResetPasswordPage.fillIn({ newPassword: 'test', confirmPassword: 'test' });
        await CreateResetPasswordPage.clickSubmit();
      });

      it('should display change password confirmation', () => confirmation.exists());

      it('should display the proper heading', () => confirmation.has({ heading: translations['label.congratulations'] }));

      it('should have an appropriate content', () => confirmation.has({ errorText: translations['label.changed.password'] }));

      describe('successful submission: redirect', () => {
        beforeEach(async function () {
          await confirmation.clickContinue();
        });

        it('should not display a passwordChanged view', () => confirmation.absent());

        it('should display a login page', () => LoginInteractor(translations['title.login']).exists());
      });
    });

    describe('non-successful submission: expired link', () => {
      const confirmation = new ChangePasswordConfirmationInteractor();

      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordExpiredLinkFailure',
        ],
      });

      beforeEach(async function () {
        await this.visit('/reset-password/test');
        await CreateResetPasswordPage.fillIn({ newPassword: 'test', confirmPassword: 'test' });
        await CreateResetPasswordPage.clickSubmit();
      });

      it('should not display change password confirmation', () => confirmation.absent());

      it('should have an appropriate text content', () => CreateResetPasswordPage.has({ errorText: translations['errors.link.expired'] }));
    });

    describe('non-successful submission: invalid link', () => {
      const confirmation = ChangePasswordConfirmationInteractor();

      setupApplication({
        disableAuth: false,
        scenarios: [
          'passwordLengthRule',
          'changePasswordInvalidLinkFailure',
        ],
      });

      beforeEach(async function () {
        this.visit('/reset-password/test');
        await CreateResetPasswordPage.fillIn({ newPassword: 'test', confirmPassword: 'test' });
        await CreateResetPasswordPage.clickSubmit();
      });

      it('should not display change password confirmation', () => confirmation.absent());

      it('should present an error message', () => CreateResetPasswordPage.has({ errorText: translations['errors.link.invalid'] }));
    });

    describe('non-successful submission: client error', () => {
      const confirmation = ChangePasswordConfirmationInteractor();

      setupApplication({
        disableAuth: false,
        scenarios: ['changePasswordClientError']
      });

      beforeEach(async function () {
        this.visit('/reset-password/test');
        await CreateResetPasswordPage.fillIn({ newPassword: 'test', confirmPassword: 'test' });
        await CreateResetPasswordPage.clickSubmit();
      });

      it('should not display change password confirmation', () => confirmation.absent());

      it('should have an appropriate text content', () => CreateResetPasswordPage.has({ errorText: translations['errors.link.invalid'] }));
    });
  });

  describe('invalid token scenario', () => {
    const errorPage = ChangePasswordErrorInteractor();

    describe('invalid token: default', () => {
      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordValidateClientError',
        ],
      });

      beforeEach(function () {
        return this.visit({
          pathname: '/reset-password/test'
        }, () => errorPage.exists());
      });

      it('should have an appropriate content', () => errorPage.has({ errorText: translations['errors.link.invalid'] }));
    });

    describe('invalid token', () => {
      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordValidateInvalidLink',
        ],
      });

      beforeEach(function () {
        return this.visit({
          pathname: '/reset-password/test/'
        }, () => errorPage.exists());
      });

      it('should have an appropriate content', () => errorPage.has({ errorText: translations['errors.link.invalid'] }));
    });

    describe('expired token', () => {
      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordValidateExpiredLink',
        ],
      });

      beforeEach(function () {
        return this.visit({
          pathname: '/reset-password/test/'
        }, () => errorPage.exists());
      });

      it('should have an appropriate content', () => errorPage.has({ errorText: translations['errors.link.expired'] }));
    });

    describe('used token', () => {
      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordValidateUsedLink',
        ],
      });

      beforeEach(function () {
        return this.visit({
          pathname: '/reset-password/test/'
        }, () => errorPage.exists());
      });

      it('should have an appropriate content', () => errorPage.has({ errorText: translations['errors.link.used'] }));
    });
    describe('system error', () => {
      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordValidateSystemError',
        ],
      });

      beforeEach(function () {
        return this.visit({
          pathname: '/reset-password/test/'
        }, () => errorPage.exists());
      });

      it('should have an appropriate content', () => errorPage.has({ errorText: translations['errors.default.server.error'] }));
    });
  });
});
