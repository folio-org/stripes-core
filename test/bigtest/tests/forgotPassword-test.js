import {
  describe,
  it,
  beforeEach,
} from '@bigtest/mocha';
import { expect } from 'chai';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-application';
import ForgotPasswordInteractor from '../interactors/ForgotPassword';

describe('forgot password form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/forgot-password');
  });

  const forgotPasswordPage = new ForgotPasswordInteractor();
  const {
    inputField,
    submitButton,
    submitButton: { button },
    mainHeading,
    callToActionParagraph,
    errorsWrapper,
    errorsWrapper: { errorsContainer },
    statusPage,
    statusPage: {
      heading: statusPageHeading,
      notificationParagraph,
      cautionParagraph,
    },
  } = forgotPasswordPage;
  const invalidInput = 'asdfgh12345';
  const nonExistingRecord = '12345';
  const existingRecord = '127-699-8925';

  describe('forgot form text input field tests', () => {
    it('should display a field to enter the email or phone number', () => {
      expect(inputField.isPresent).to.be.true;
    });

    it('should have an empty value', () => {
      expect(inputField.val).to.equal('');
    });
  });

  describe('forgot form submit button tests', () => {
    it('should display a "Continue" button to submit a request', () => {
      expect(button.isPresent).to.be.true;
    });

    it('should have a disabled "Continue" button by default', () => {
      expect(submitButton.isDisabled).to.be.true;
    });
  });

  describe('forgot form submit button test after filling the input', () => {
    beforeEach(async () => {
      await inputField.fillInput(invalidInput);
    });

    it.always('should have an enabled submit button', () => {
      expect(submitButton.isDisabled).to.be.false;
    });
  });

  describe('forgot form headings tests', () => {
    it('should display the heading', () => {
      expect(mainHeading.isPresent).to.be.true;
    });

    it('should have the main heading content equal to forgot username label', () => {
      expect(mainHeading.text).to.equal(translations['label.forgotPassword']);
    });

    it('should display the paragraph', () => {
      expect(callToActionParagraph.isPresent).to.be.true;
    });

    it('should have the paragraph content equal to forgot username or password call to action label', () => {
      expect(callToActionParagraph.text).to.equal(
        translations['label.forgotUsernameOrPasswordCallToAction']
      );
    });
  });

  describe('error container initial behaviour', () => {
    describe('forgot form error container integration test', () => {
      it('should display the error container wrapper', () => {
        expect(errorsWrapper.isPresent).to.be.true;
      });

      it.always('should not display the error container', () => {
        expect(errorsContainer.isPresent).to.be.false;
      });
    });
  });

  describe('forgot form submission behaviour tests', () => {
    describe('forgot form validation tests', () => {
      beforeEach(async () => {
        await inputField.fillInput(invalidInput);
        await submitButton.click();
      });

      it('should display an error container if the input is not a valid email',
        () => {
          expect(errorsContainer.isPresent).to.be.true;
        });

      it('should have an appropriate error text content', () => {
        expect(errorsContainer.text).to.equal(
          translations['errors.email.invalid']
        );
      });
    });

    describe('forgot form submission behaviour when the record does not match any in the DB', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await inputField.fillInput(nonExistingRecord);
        await submitButton.click();
      });

      it('should display an error container if the input does not match not any record', () => {
        expect(errorsContainer.isPresent).to.be.true;
      });

      it('should should have an appropriate error text content', () => {
        expect(errorsContainer.text).to.equal(
          translations['errors.unable.locate.account']
        );
      });
    });

    describe('Forgot form successful submission behaviour', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordSuccess'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await inputField.fillInput(existingRecord);
        await submitButton.click();
      });

      it.always('should not display an error container if the input match any record in DB', () => {
        expect(errorsContainer.isPresent).to.be.false;
      });

      it('should be redirected to the Check email status page', () => {
        expect(statusPage.isPresent).to.be.true;
      });

      it('should display a header', () => {
        expect(statusPageHeading.isPresent).to.be.true;
      });

      it('should have the header with an appropriate text content equal to check email label', () => {
        expect(statusPageHeading.text).to.equal(
          translations['label.check.email']
        );
      });

      it('should display a paragraph with notification', () => {
        expect(notificationParagraph.isPresent).to.be.true;
      });

      it('should have the paragraph with an appropriate text content equal to sent email precautions label', () => {
        expect(notificationParagraph.text).to.equal(
          translations['label.your.email']
        );
      });

      it('should display a paragraph with precautions', () => {
        expect(cautionParagraph.isPresent).to.be.true;
      });

      it('should have the paragraph with an appropriate text content equal to check email precautions label', () => {
        expect(cautionParagraph.text).to.equal(
          translations['label.caution.email']
        );
      });
    });
  });
});
