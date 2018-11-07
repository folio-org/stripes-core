import { describe, it, beforeEach } from '@bigtest/mocha';
import { Interactor } from '@bigtest/interactor';
import { expect } from 'chai';
import TextFieldInteractor
  from '@folio/stripes-components/lib/TextField/tests/interactor';
import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-application';
import SubmitButtonInteractor from '../interactors/submit-button';

describe.only('Forgot username form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/forgot/username');
  });

  const inputField = new TextFieldInteractor('[class^="formGroup--"]');
  const submitButton = new SubmitButtonInteractor();
  const mainHeading = new Interactor('[data-test-h1]');
  const callToActionParagraph = new Interactor('[data-test-p]');
  const { buttonInteractor:button } = submitButton;

  describe('Forgot form text input field integration tests', () => {
    it('Should have a field to enter the email or phone number', () => {
      expect(inputField.isPresent).to.be.true;
    });

    it('Should have an empty value', () => {
      expect(inputField.val).to.equal('');
    });
  });

  describe('Forgot form submit button integration tests', () => {
    it('Should have a "Continue" button to submit a request', () => {
      expect(button.isPresent).to.be.true;
    });

    it('Should have a disabled "Continue" button by default', () => {
      expect(submitButton.isDisabled).to.be.true;
    });
  });

  describe('Forgot form headings integration tests', () => {
    it('Should have the heading', () => {
      expect(mainHeading.isPresent).to.be.true;
    });

    it(`Should have the main heading content equal to forgot username label 
  in english translation`, () => {
      expect(mainHeading.text).to.equal(translations['label.forgotUsername']);
    });

    it('Should have the paragraph', () => {
      expect(callToActionParagraph.isPresent).to.be.true;
    });

    it(`Should have the paragraph content equal to forgot username or password
   call to action label in english translation`, () => {
      expect(callToActionParagraph.text).to.equal(
        translations['label.forgotUsernameOrPasswordCallToAction']
      );
    });
  });
});
