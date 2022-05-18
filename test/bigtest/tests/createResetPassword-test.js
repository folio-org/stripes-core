import { expect } from 'chai';

import {
  describe,
  it,
  beforeEach,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-core-application';
import CreateResetPasswordInteractor from '../interactors/CreateResetPassword';
import ChangePasswordErrorPageInteractor from '../interactors/ChangePasswordErrorPage';
import ChangePasswordConfirmationInteractor from '../interactors/ChangePasswordConfirmation';
import LoginInteractor from '../interactors/login';

import translations from '../../../translations/stripes-core/en';

describe('Create/Reset password page', () => {
  const CreateResetPasswordPage = new CreateResetPasswordInteractor('form[class^="form--"]');

  setupApplication({
    disableAuth: false,
    scenarios: ['passwordLengthRule'],
  });

  describe('valid token scenario', () => {
    beforeEach(function () {
      return this.visit({
        pathname: '/reset-password/test',
      }, () => {
        expect(CreateResetPasswordPage.isPresent).to.be.true;
      });
    });

    describe('default behavior', () => {
      describe('new password field', () => {
        it('should be presented', () => {
          expect(CreateResetPasswordPage.newPassword.isPresent).to.be.true;
        });

        it('should have type password', () => {
          expect(CreateResetPasswordPage.newPassword.type).to.equal('password');
        });

        it('should have proper label', () => {
          expect(CreateResetPasswordPage.newPassword.label).to.equal(translations['createResetPassword.newPassword']);
        });
      });

      describe('confirm password field', () => {
        it('should be presented', () => {
          expect(CreateResetPasswordPage.confirmPassword.isPresent).to.be.true;
        });

        it('should have type password', () => {
          expect(CreateResetPasswordPage.confirmPassword.type).to.equal('password');
        });

        it('should have proper label', () => {
          expect(CreateResetPasswordPage.confirmPassword.label).to.equal(translations['createResetPassword.confirmPassword']);
        });
      });

      describe('toggle mask button', () => {
        it('should be presented', () => {
          expect(CreateResetPasswordPage.toggleMask.isPresent).to.be.true;
        });

        it('should have proper text', () => {
          expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.showPassword']);
        });
      });

      describe('submit button', () => {
        it('should be presented', () => {
          expect(CreateResetPasswordPage.submit.isPresent).to.be.true;
        });

        it('should have proper text', () => {
          expect(CreateResetPasswordPage.submit.text).to.equal(translations.setPassword);
        });

        it('should be disabled', () => {
          expect(CreateResetPasswordPage.submit.isDisabled).to.be.true;
        });

        describe('error message', () => {
          it.always('should not be presented', () => {
            expect(CreateResetPasswordPage.message.isPresent).to.be.false;
          });
        });
      });

      describe('same passwords insertion', () => {
        beforeEach(async function () {
          const { newPassword, confirmPassword } = CreateResetPasswordPage;

          await newPassword.fillAndBlur('test');
          await confirmPassword.fillAndBlur('test');
        });

        describe('new password field', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.newPassword.isPresent).to.be.true;
          });

          it.always('should have type password', () => {
            expect(CreateResetPasswordPage.newPassword.type).to.equal('password');
          });

          it.always('should have proper label', () => {
            expect(CreateResetPasswordPage.newPassword.label).to.equal(translations['createResetPassword.newPassword']);
          });

          it('should have inserted password', () => {
            expect(CreateResetPasswordPage.newPassword.val).to.equal('test');
          });
        });

        describe('confirm password field', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.confirmPassword.isPresent).to.be.true;
          });

          it.always('should have type password', () => {
            expect(CreateResetPasswordPage.confirmPassword.type).to.equal('password');
          });

          it.always('should have proper label', () => {
            expect(CreateResetPasswordPage.confirmPassword.label).to.equal(translations['createResetPassword.confirmPassword']);
          });

          it('should have inserted password', () => {
            expect(CreateResetPasswordPage.confirmPassword.val).to.equal('test');
          });
        });

        describe('toggle mask button', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.toggleMask.isPresent).to.be.true;
          });

          it.always('should have proper text', () => {
            expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.showPassword']);
          });

          describe('toggle mask from password to text', () => {
            beforeEach(async () => {
              await CreateResetPasswordPage.toggleMask.toggleMaskButton();
            });

            it('checks toggled button text', () => {
              expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.hidePassword']);
            });

            it('changes the type of the confirm password field to text', () => {
              expect(CreateResetPasswordPage.confirmPassword.type).to.equal('text');
            });

            it('changes the type of the new password field to text', () => {
              expect(CreateResetPasswordPage.newPassword.type).to.equal('text');
            });

            describe('toggle mask from text to password', () => {
              beforeEach(async () => {
                await CreateResetPasswordPage.toggleMask.toggleMaskButton();
              });

              it('checks toggled button text', () => {
                expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.showPassword']);
              });

              it('changes the type of the confirm password field to text', () => {
                expect(CreateResetPasswordPage.confirmPassword.type).to.equal('password');
              });

              it('changes the type of the new password field to text', () => {
                expect(CreateResetPasswordPage.newPassword.type).to.equal('password');
              });
            });
          });
        });

        describe('submit button', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.submit.isPresent).to.be.true;
          });

          it.always('should have proper text', () => {
            expect(CreateResetPasswordPage.submit.text).to.equal(translations.setPassword);
          });

          it.always('should be active', () => {
            expect(CreateResetPasswordPage.submit.isDisabled).to.be.false;
          });

          describe('error message', () => {
            it.always('should not be presented', () => {
              expect(CreateResetPasswordPage.message.isPresent).to.be.false;
            });
          });
        });
      });

      describe('different passwords insertion', () => {
        beforeEach(async function () {
          const { newPassword, confirmPassword } = CreateResetPasswordPage;

          await newPassword.fillAndBlur('test-test');
          await confirmPassword.fillAndBlur('test');
        });

        describe('new password field', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.newPassword.isPresent).to.be.true;
          });

          it.always('should have type password', () => {
            expect(CreateResetPasswordPage.newPassword.type).to.equal('password');
          });

          it.always('should have proper label', () => {
            expect(CreateResetPasswordPage.newPassword.label).to.equal(translations['createResetPassword.newPassword']);
          });

          it('should have inserted password', () => {
            expect(CreateResetPasswordPage.newPassword.val).to.equal('test-test');
          });
        });

        describe('confirm password field', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.confirmPassword.isPresent).to.be.true;
          });

          it.always('should have type password', () => {
            expect(CreateResetPasswordPage.confirmPassword.type).to.equal('password');
          });

          it.always('should have proper label', () => {
            expect(CreateResetPasswordPage.confirmPassword.label).to.equal(translations['createResetPassword.confirmPassword']);
          });

          it('should have inserted password', () => {
            expect(CreateResetPasswordPage.confirmPassword.val).to.equal('test');
          });
        });

        describe('toggle mask button', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.toggleMask.isPresent).to.be.true;
          });

          it.always('should have proper text', () => {
            expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.showPassword']);
          });

          describe('toggle mask from password to text', () => {
            beforeEach(async () => {
              await CreateResetPasswordPage.toggleMask.toggleMaskButton();
            });

            it('checks toggled button text', () => {
              expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.hidePassword']);
            });

            it('changes the type of the form fields to text', () => {
              expect(CreateResetPasswordPage.confirmPassword.type).to.equal('text');
            });

            it('changes the type of the form fields to text', () => {
              expect(CreateResetPasswordPage.newPassword.type).to.equal('text');
            });

            describe('toggle mask from text to password', () => {
              beforeEach(async () => {
                await CreateResetPasswordPage.toggleMask.toggleMaskButton();
              });

              it('checks toggled button text', () => {
                expect(CreateResetPasswordPage.toggleMask.text).to.equal(translations['button.showPassword']);
              });

              it('changes the type of the form fields to text', () => {
                expect(CreateResetPasswordPage.confirmPassword.type).to.equal('password');
              });

              it('changes the type of the form fields to text', () => {
                expect(CreateResetPasswordPage.newPassword.type).to.equal('password');
              });
            });
          });
        });

        describe('submit button', () => {
          it.always('should be presented', () => {
            expect(CreateResetPasswordPage.submit.isPresent).to.be.true;
          });

          it.always('should have proper text', () => {
            expect(CreateResetPasswordPage.submit.text).to.equal(translations.setPassword);
          });

          it('should be disabled', () => {
            expect(CreateResetPasswordPage.submit.isDisabled).to.be.true;
          });

          describe('error message', () => {
            it('should be presented', () => {
              expect(CreateResetPasswordPage.message.isPresent).to.be.true;
            });

            it('should have proper text', () => {
              expect(CreateResetPasswordPage.message.text).to.equal(translations['errors.password.match.error']);
            });
          });
        });
      });
    });

    describe('successful submission', () => {
      const ChangePasswordConfirmation = new ChangePasswordConfirmationInteractor();
      const {
        newPassword,
        confirmPassword,
        submitForm,
      } = CreateResetPasswordPage;
      const {
        heading,
        message,
        redirect,
      } = ChangePasswordConfirmation;

      setupApplication({
        disableAuth: false,
        scenarios: [
          'passwordLengthRule',
          'changePasswordSuccess'
        ],
      });

      beforeEach(async function () {
        await this.visit('/reset-password/test');
        await newPassword.fillAndBlur('test');
        await confirmPassword.fillAndBlur('test');
        await submitForm.clickSubmit();
      });

      it('should display change password confirmation', () => {
        expect(ChangePasswordConfirmation.isPresent).to.be.true;
      });

      it('should display a heading', () => {
        expect(heading.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(heading.text).to.equal(translations['label.congratulations']);
      });

      it('should display a message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['label.changed.password']);
      });

      it('should display a button', () => {
        expect(redirect.isPresent).to.be.true;
      });

      describe('successful submission: redirect', () => {
        beforeEach(async function () {
          await redirect.clickContinue();
        });

        const login = new LoginInteractor('form[class^="form--"]');

        it('should not display a passwordChanged view', () => {
          expect(ChangePasswordConfirmation.isPresent).to.be.false;
        });

        it('should display a login page', () => {
          expect(login.isPresent).to.be.true;
        });
      });
    });

    describe('non-successful submission: expired link', () => {
      const ChangePasswordConfirmation = new ChangePasswordConfirmationInteractor();
      const {
        newPassword,
        confirmPassword,
        submitForm,
        message,
      } = CreateResetPasswordPage;

      setupApplication({
        disableAuth: false,
        scenarios: [
          'changePasswordExpiredLinkFailure',
        ],
      });

      beforeEach(async function () {
        await this.visit('/reset-password/test');
        await newPassword.fillAndBlur('test');
        await confirmPassword.fillAndBlur('test');
        await submitForm.clickSubmit();
      });

      it('should not display change password confirmation', () => {
        expect(ChangePasswordConfirmation.isPresent).to.be.false;
      });

      it('should display CreateResetPassword page', () => {
        expect(CreateResetPasswordPage.isPresent).to.be.true;
      });

      it('should present an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate text content', () => {
        expect(message.text).to.equal(translations['errors.link.expired']);
      });
    });

    describe('non-successful submission: invalid link', () => {
      const ChangePasswordConfirmation = new ChangePasswordConfirmationInteractor();
      const {
        newPassword,
        confirmPassword,
        submitForm,
        message,
      } = CreateResetPasswordPage;

      setupApplication({
        disableAuth: false,
        scenarios: [
          'passwordLengthRule',
          'changePasswordInvalidLinkFailure',
        ],
      });

      beforeEach(async function () {
        this.visit('/reset-password/test');
        await newPassword.fillAndBlur('test');
        await confirmPassword.fillAndBlur('test');
        await submitForm.clickSubmit();
      });

      it('should not display change password confirmation', () => {
        expect(ChangePasswordConfirmation.isPresent).to.be.false;
      });

      it('should display CreateResetPassword page', () => {
        expect(CreateResetPasswordPage.isPresent).to.be.true;
      });

      it('should present an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate text content', () => {
        expect(message.text).to.equal(translations['errors.link.invalid']);
      });
    });

    describe('non-successful submission: client error', () => {
      const ChangePasswordConfirmation = new ChangePasswordConfirmationInteractor();
      const {
        newPassword,
        confirmPassword,
        submitForm,
        message,
      } = CreateResetPasswordPage;

      setupApplication({
        disableAuth: false,
        scenarios: ['changePasswordClientError']
      });

      beforeEach(async function () {
        this.visit('/reset-password/test');
        await newPassword.fillAndBlur('test');
        await confirmPassword.fillAndBlur('test');
        await submitForm.clickSubmit();
      });

      it('should not display change password confirmation', () => {
        expect(ChangePasswordConfirmation.isPresent).to.be.false;
      });

      it('should display CreateResetPassword page', () => {
        expect(CreateResetPasswordPage.isPresent).to.be.true;
      });

      it('should present an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate text content', () => {
        expect(message.text).to.equal(translations['errors.link.invalid']);
      });
    });
  });

  describe('invalid token scenario', () => {
    const ChangePasswordErrorPage = new ChangePasswordErrorPageInteractor();
    const { message } = ChangePasswordErrorPage;

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
        }, () => {
          expect(ChangePasswordErrorPage.isPresent).to.be.true;
        });
      });

      it('should display an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['errors.link.invalid']);
      });
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
        }, () => {
          expect(ChangePasswordErrorPage.isPresent).to.be.true;
        });
      });

      it('should display an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['errors.link.invalid']);
      });
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
        }, () => {
          expect(ChangePasswordErrorPage.isPresent).to.be.true;
        });
      });

      it('should display an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['errors.link.expired']);
      });
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
        }, () => {
          expect(ChangePasswordErrorPage.isPresent).to.be.true;
        });
      });

      it('should display an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['errors.link.used']);
      });
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
        }, () => {
          expect(ChangePasswordErrorPage.isPresent).to.be.true;
        });
      });

      it('should display an error message', () => {
        expect(message.isPresent).to.be.true;
      });

      it('should have an appropriate content', () => {
        expect(message.text).to.equal(translations['errors.default.server.error']);
      });
    });
  });
});
