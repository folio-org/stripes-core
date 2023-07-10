import {
  describe,
  it,
  beforeEach,
} from 'mocha';
import { expect } from 'chai';

import {
  TextField,
  Button,
  HTML,
  MessageBanner,
} from '@folio/stripes-testing';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-core-application';
import always from '../helpers/always';
// import ForgotUsernameInteractor from '../interactors/ForgotUsername';
import { StatusPage as StatusPageInteractor } from '../interactors/common';

const ForgotUsernameInteractor = HTML.extend('forgot username')
  .selector('form[class^="form--"]')
  .filters({
    headingText: el => el.querySelector('[data-test-h1]')?.textContent || '',
    submitDisabled: el => el.querySelector('button[disabled]') !== null,
    callToActionText: el => el.querySelector('[data-test-p]')?.textContent || '',
  })
  .actions({
    fillIn : async ({ find }, value) => {
      await find(TextField()).fillIn(value);
    },
    clickSubmit: async ({ find }) => {
      await find(Button({ type: 'submit' })).click();
    },
    fillAndSubmit: async ({ find }, value) => {
      await find(TextField()).fillIn(value);
      await find(Button({ type: 'submit' })).click();
    }
  });

const ErrorsContainerInteractor = MessageBanner.extend('errors container')
  .selector('[data-test-errors]');

describe('Forgot username form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/forgot-username');
  });

  const forgotUsernamePage = ForgotUsernameInteractor();
  const invalidInput = 'asdfgh12345';
  const nonExistingRecord = '12345';
  const existingRecord = '127-699-8925';

  describe('forgot form text input field tests', () => {
    it('should display a field to enter the email or phone number', () => TextField().exists());

    it('should have an empty value', () => TextField().has({ value: '' }));
  });

  describe('forgot form submit button tests', () => {
    it('should display a disabled "Continue" button to submit a request', () => Button({ type: 'submit', disabled: true }).exists());
  });

  describe('forgot form submit button test after filling the input', () => {
    beforeEach(async () => {
      await forgotUsernamePage.fillIn(invalidInput);
    });

    it('should have an enabled submit button', always(() => forgotUsernamePage.has({ submitDisabled: false })));
  });

  describe('forgot form headings tests', () => {
    it('should have the main heading content equal to forgot username label', () => forgotUsernamePage.has({ headingText: translations['label.forgotUsername'] }));

    it('should have the paragraph content equal to forgot username or password call to action label', () => forgotUsernamePage.has({ callToActionText: translations['label.forgotUsernameCallToAction'] }));
  });

  describe('error container initial behaviour', () => {
    describe('forgot form error container integration test', () => {
      it('should not display the error container', always(() => ErrorsContainerInteractor({ visible: false }).exists()));
    });
  });

  describe('forgot form submission behaviour tests', () => {
    const errorsContainer = ErrorsContainerInteractor();
    describe('forgot form validation tests', () => {
      beforeEach(async () => {
        await forgotUsernamePage.fillAndSubmit(invalidInput);
      });

      it('should have an appropriate error text content if the input doesn\'t contain a valid email', () => errorsContainer.has({ text: translations['errors.email.invalid'] }));
    });

    describe('forgot form submission failed: no account found', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(nonExistingRecord);
      });

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.unable.locate.account'] }));
    });

    describe('forgot form submission failed: no account found - default', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameClientError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(nonExistingRecord);
      });

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.unable.locate.account'] }));
    });

    describe('forgot form submission failed: multiple accounts found', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameMultipleRecords'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(nonExistingRecord);
      });

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.forgotten.username.found.multiple.users'] }));
    });

    describe('forgot form submission failed: server error', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameServerError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(nonExistingRecord);
      });

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.default.server.error'] }));
    });

    describe('forgot form submission failed: account locked', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameLockedAccount'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if server error occurred', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.forgotten.password.found.inactive'] }));
    });

    describe('forgot form successful submission behaviour', () => {
      const statusPage = StatusPageInteractor();
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotUsernameSuccess'],
      });

      beforeEach(async function () {
        this.visit('/forgot-username');
        await forgotUsernamePage.fillAndSubmit(existingRecord);
      });

      it('should not display an error container if the input match any record in DB', () => ErrorsContainerInteractor({ visible: false }).exists());

      it('should be redirected to the Check email status page', () => statusPage.exists());

      it('should have the header with an appropriate text content equal to check email label', () => statusPage.has({ headingText: translations['label.check.email'] }));

      it('should have the paragraph with an appropriate text content equal to check email precautions label', () => statusPage.has({ cautionText: translations['label.caution.email'] }));
    });
  });
});
