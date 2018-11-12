import { describe, it, beforeEach } from '@bigtest/mocha';
import { expect } from 'chai';
import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-application';
import ForgotUsernameInteractor from '../interactors/ForgotPassword';

describe('Forgot password form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/forgot-password');
  });

  const forgotUsernamePage = new ForgotUsernameInteractor();
  const
    {
      inputField,
      submitButton,
      submitButton: { button },
      mainHeading,
      callToActionParagraph,
      errorsWrapper,
      errorsWrapper: { errorsContainer },
      statusPage,
      statusPage:
        {
          heading: statusPageHeading,
          cautionParagraph
        },
    } = forgotUsernamePage;
  const invalidInput = 'asdfgh12345';
  const nonExistingRecord = '12345';
  const existingRecord = 'hillard@roob-glover.am';

  describe('Forgot form text input field tests', () => {
    it('Should display a field to enter the email or phone number', () => {
      expect(inputField.isPresent).to.be.true;
    });

    it('Should have an empty value', () => {
      expect(inputField.val).to.equal('');
    });
  });

  describe('Forgot form submit button tests', () => {
    it('Should display a "Continue" button to submit a request', () => {
      expect(button.isPresent).to.be.true;
    });

    it('Should have a disabled "Continue" button by default', () => {
      expect(submitButton.isDisabled).to.be.true;
    });
  });

  describe('Forgot form submit button test after filling the input', () => {
    beforeEach(async () => {
      await inputField.fillInput(invalidInput);
    });
    it('Should have an enabled submit button', () => {
      expect(submitButton.isDisabled).to.be.false;
    });
  });

  describe('Forgot form headings tests', () => {
    it('Should display the heading', () => {
      expect(mainHeading.isPresent).to.be.true;
    });

    it(`Should have the main heading content equal to forgot username label 
    in english translation`, () => {
      expect(mainHeading.text).to.equal(translations['label.forgotPassword']);
    });

    it('Should display the paragraph', () => {
      expect(callToActionParagraph.isPresent).to.be.true;
    });

    it(`Should have the paragraph content equal to forgot username or password
    call to action label in english translation`, () => {
      expect(callToActionParagraph.text).to.equal(
        translations['label.forgotUsernameOrPasswordCallToAction']
      );
    });
  });

  describe('Error container initial behaviour', () => {
    describe('Forgot form error container integration test', () => {
      it('Should display the error container wrapper', () => {
        expect(errorsWrapper.isPresent).to.be.true;
      });

      it('Should not display the error container', () => {
        expect(errorsContainer.isPresent).to.be.false;
      });
    });
  });

  describe('Forgot form submission behaviour tests', () => {
    describe('Forgot form validation tests', () => {
      beforeEach(async () => {
        await inputField.fillInput(invalidInput);
        await submitButton.click();
      });

      it('Should display an error container if the input is not a valid email',
        () => {
          expect(errorsContainer.isPresent).to.be.true;
        });

      it('Should have an appropriate error text content', () => {
        expect(errorsContainer.text).to.equal(
          translations['errors.email.invalid']
        );
      });
    });

    describe(`Forgot form submission behaviour
     when the record does not match any in the DB`, () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await inputField.fillInput(nonExistingRecord);
        await submitButton.click();
      });

      it(`Should display an error container 
      if the input does not match not any record`, () => {
        expect(errorsContainer.isPresent).to.be.true;
      });

      it('Should should have an appropriate error text content', () => {
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

      it(`Should not display an error container 
      if the input match any record in DB`, () => {
        expect(errorsContainer.isPresent).to.be.false;
      });

      it('Should be redirected to the Check email status page', () => {
        expect(statusPage.isPresent).to.be.true;
      });

      it('Should display a header', () => {
        expect(statusPageHeading.isPresent).to.be.true;
      });

      it(`Should have the header with an appropriate text content 
      equal to check email label in english translation`, () => {
        expect(statusPageHeading.text).to.equal(
          translations['label.check.email']
        );
      });

      it('Should display a paragraph with precautions', () => {
        expect(cautionParagraph.isPresent).to.be.true;
      });

      it(`Should have the paragraph with an appropriate text content 
      equal to check email precautions label in english translation`, () => {
        expect(cautionParagraph.text).to.equal(
          translations['label.caution.email']
        );
      });
    });
  });
});
