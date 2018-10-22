import { describe, it, beforeEach } from '@bigtest/mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application';
import LoginInteractor from '../interactors/login';
import translations from '../../../translations/stripes-core/en';

const parseMessageFromJsx = (translation, values) => {
  const parsedMessage = new DOMParser().parseFromString(translation, 'text/html').body.textContent || '';

  return Object.keys(values).reduce((res, key) => {
    return res.includes(key) ? res.replace(`{${key}}`, values[key]) : res;
  }, parsedMessage);
};

describe('Login', () => {
  const login = new LoginInteractor('form[class^="form--"]');

  setupApplication({ disableAuth: false });

  it('has username and password fields', () => {
    expect(login.username.isPresent).to.be.true;
    expect(login.password.isPresent).to.be.true;
  });

  it('has a disabled submit button', () => {
    expect(login.submit.isPresent).to.be.true;
    expect(login.submit.isDisabled).to.be.true;
  });

  it.always('error message should not be present', () => {
    expect(login.message.isPresent).to.be.false;
  });

  describe('username insertion', () => {
    beforeEach(async () => {
      const username = login.username;

      await username.fill('test');
    });

    it('has an active submit button', () => {
      expect(login.submit.isPresent).to.be.true;
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

    it.always('has a disabled submit button', () => {
      expect(login.submit.isPresent).to.be.true;
      expect(login.submit.isDisabled).to.be.true;
    });

    it.always('error message should not be present', () => {
      expect(login.message.isPresent).to.be.false;
    });
  });

  describe('errors', () => {
    describe('error for the wrong username', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'username.invalid',
                parameters: [
                  {
                    key: 'username',
                    value: 'username',
                  },
                ]
              }
            ] }
          )
        }, 422);

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
        expect(login.message.text).to.equal(parseMessageFromJsx(
          translations['loginServices.login.username.invalid'],
          { username: 'username' }
        ));
      });
    });

    describe('error for the wrong password', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'password.invalid',
              }
            ] }
          )
        }, 422);

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
        expect(login.message.text).to.equal(translations['loginServices.login.password.invalid']);
      });
    });

    describe('error for the server error', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {}, 500);

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
        expect(login.message.text).to.equal(translations['loginServices.login.default.error']);
      });
    });

    describe('error for the third attempt to enter wrong password', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'third.failed.attempt',
              }
            ] }
          )
        }, 422);

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
        expect(login.message.text).to.equal(translations['loginServices.login.third.failed.attempt']);
      });
    });

    describe('error for the fifth attempt to enter wrong password', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'fifth.failed.attempt.blocked',
              }
            ] }
          )
        }, 422);

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
        expect(login.message.text).to.equal(translations['loginServices.login.fifth.failed.attempt.blocked']);
      });
    });

    describe('error for the attempt to login to locked account', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'user.blocked',
              }
            ] }
          )
        }, 422);

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
        expect(login.message.text).to.equal(translations['loginServices.login.user.blocked']);
      });
    });

    describe('multiple errors', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(
            { errors: [
              {
                type: 'error',
                code: 'user.blocked',
              },
              {
                type: 'error',
                code: 'third.failed.attempt',
              },
            ] }
          )
        }, 422);

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
          `${translations['loginServices.login.user.blocked']}${translations['loginServices.login.third.failed.attempt']}`
        );
      });
    });

    describe('invalid response body', () => {
      beforeEach(async function () {
        const { username, password, submit } = login;

        this.server.post('bl-users/login', {
          errorMessage: JSON.stringify(['test'])
        }, 422);

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
          translations['loginServices.login.default.error']
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
