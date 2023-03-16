import {
  describe,
  it,
  beforeEach,
} from 'mocha';

import {
  TextField,
  Button,
  HTML,
  MessageBanner,
} from '@folio/stripes-testing';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-core-application';
import always from '../helpers/always';
import { StatusPage as StatusPageInteractor } from '../interactors/common';

const ForgotPasswordInteractor = HTML.extend('forgot password')
  .selector('form[class^="form--"]')
  .filters({
    headingText: el => el.querySelector('[data-test-h1]')?.textContent || '',
    submitDisabled: el => el.querySelector('button[disabled]') !== null,
    callToActionText: el => el.querySelector('[data-test-p]')?.text || '',
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

describe('forgot password form test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit('/forgot-password');
  });

  const forgotPasswordPage = ForgotPasswordInteractor();
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
      await forgotPasswordPage.fillIn(existingRecord);
    });

    it('should have an enabled submit button', always(() => forgotPasswordPage.has({ submitDisabled: false })));
  });

  describe('forgot form headings tests', () => {
    it('should display the heading equal to forgot username or password call to action label', () => forgotPasswordPage.has({ headingText: translations['label.forgotPassword'] }));
  });

  describe('error container initial behaviour', () => {
    describe('forgot form error container integration test', () => {
      it('should not display the error container', always(() => ErrorsContainerInteractor({ visible: false }).exists()));
    });
  });

  describe('forgot form submission behaviour tests', () => {
    const errorsContainer = ErrorsContainerInteractor();
    describe('forgot form submission failed: no account found', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if the input does not match any record', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.unable.locate.account'] }));
    });

    describe('forgot form submission failed: no account found - default', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordClientError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if the input does not match any record', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.unable.locate.account.password'] }));
    });

    describe('forgot form submission failed: multiple accounts found', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordMultipleRecords'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if the input matches many accounts', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.forgotten.password.found.multiple.users'] }));
    });

    describe('forgot form submission failed: server error', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordServerError'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if server error occurred', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.default.server.error'] }));
    });

    describe('forgot form submission failed: account locked', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordLockedAccount'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(nonExistingRecord);
      });

      it('should display an error container if server error occurred', () => errorsContainer.exists());

      it('should should have an appropriate error text content', () => errorsContainer.has({ text: translations['errors.forgotten.password.found.inactive'] }));
    });

    describe('Forgot form successful submission behaviour', () => {
      const statusPage = StatusPageInteractor();
      setupApplication({
        disableAuth: false,
        scenarios: ['forgotPasswordSuccess'],
      });

      beforeEach(async function () {
        this.visit('/forgot-password');
        await forgotPasswordPage.fillAndSubmit(existingRecord);
      });

      it('should not display an error container if the input match any record in DB', always(() => ErrorsContainerInteractor({ visible: false }).exists()));

      it('should be redirected to the Check email status page', () => statusPage.exists());

      it('should display a header', () => statusPage.has({ headingText: translations['label.check.email'] }));

      it('should have the paragraph with an appropriate text content equal to sent email precautions label', () => statusPage.has({ notificationText: translations['label.your.email'] }));

      it('should have the paragraph with an appropriate text content equal to check email precautions label', () => statusPage.has({ cautionText: translations['label.caution.email'] }));
    });
  });
});
