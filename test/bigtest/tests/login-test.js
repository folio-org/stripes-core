import { expect } from 'chai';

import {
  describe,
  it,
  beforeEach
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-core-application';
import LoginInteractor from '../interactors/login';

import translations from '../../../translations/stripes-core/en';

describe('Login', () => {
  const login = new LoginInteractor('form[class^="form--"]');

  setupApplication({ disableAuth: false });

  describe('default behavior', () => {
    it('should have username field', () => {
      expect(login.username.isPresent).to.be.true;
    });

    it('should have password field', () => {
      expect(login.password.isPresent).to.be.true;
    });

    it('should have forgot password link', () => {
      expect(login.forgotPassword.isPresent).to.be.true;
    });

    it('should have forgot username link', () => {
      expect(login.forgotUsername.isPresent).to.be.true;
    });

    it('should have submit button', () => {
      expect(login.submit.isPresent).to.be.true;
    });

    it('submit button should be disabled', () => {
      expect(login.submit.isDisabled).to.be.true;
    });

    it.always('error message should not be present', () => {
      expect(login.message.isPresent).to.be.false;
    });
  });

  describe('username insertion', () => {
    beforeEach(async () => {
      const { username } = login;

      await username.fill('test');
    });

    it('should have submit button', () => {
      expect(login.submit.isPresent).to.be.true;
    });

    it('submit button should be active', () => {
      expect(login.submit.isDisabled).to.be.false;
    });

    it.always('error message should not be present', () => {
      expect(login.message.isPresent).to.be.false;
    });
  });

  describe('password insertion', () => {
    beforeEach(async () => {
      const password = login.password;

      await password.fill('test');
    });

    it('should have submit button', () => {
      expect(login.submit.isPresent).to.be.true;
    });

    it.always('submit button should be disabled', () => {
      expect(login.submit.isDisabled).to.be.true;
    });

    it.always('error message should not be present', () => {
      expect(login.message.isPresent).to.be.false;
    });
  });

  describe('errors', () => {
    describe('error for the wrong username', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['wrongUsername'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.username.incorrect']);
      });
    });

    describe('error for the wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['wrongPassword'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.password.incorrect']);
      });
    });

    describe('error for the server error', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['serverError'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.default.server.error']);
      });
    });

    describe('error for the third attempt to enter wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['thirdAttemptToLogin'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.password.incorrect.warn.user']);
      });
    });

    describe('error for the fifth attempt to enter wrong password', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['fifthAttemptToLogin'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.password.incorrect.block.user']);
      });
    });

    describe('error for the attempt to login to locked account', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['lockedAccount'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(translations['errors.user.blocked']);
      });
    });

    describe('multiple errors', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['multipleErrors'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(
          `${translations['errors.user.blocked']}${translations['errors.password.incorrect.warn.user']}`
        );
      });
    });

    describe('invalid response body', () => {
      setupApplication({
        disableAuth: false,
        scenarios: ['invalidResponseBody'],
      });

      beforeEach(async function () {
        const { username, password, submit } = login;

        await username.fill('username');
        await password.fill('password');
        await submit.click();
      });

      it.always('username should not be reset upon failed submit', () => {
        expect(login.username.value).to.equal('username');
      });

      it('password should be reset upon failed submit', () => {
        expect(login.password.value).to.equal('');
      });

      it('error message should be present upon failed submit', () => {
        expect(login.message.isPresent).to.be.true;
      });

      it('error message should have proper text upon failed submit', () => {
        expect(login.message.text).to.equal(
          translations['errors.default.error']
        );
      });
    });
  });

  describe('with valid credentials', () => {
    beforeEach(async () => {
      const { username, password, submit } = login;

      await username.fill('username');
      await password.fill('password');
      await submit.click();
      await submit.blur();
    });

    it('login page should not be displayed upon successful login', () => {
      expect(login.isPresent).to.be.false;
    });
  });
});
