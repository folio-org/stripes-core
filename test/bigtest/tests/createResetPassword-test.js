import { expect } from 'chai';

import {
  describe,
  it,
  beforeEach,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CreateResetPasswordInteractor from '../interactors/CreateResetPassword';

import translations from '../../../translations/stripes-core/en';

describe('Crereate/Reset password page', () => {
  const CreateResetPasswordPage = new CreateResetPasswordInteractor('form[class^="form--"]');

  setupApplication({
    disableAuth: false,
    scenarios: ['passwordLengthRule'],
  });

  beforeEach(function () {
    return this.visit({
      pathname: '/create-password/test/actionIdTest',
      state: {
        isValidToken: true,
        errorCodes: [],
      }
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
});
