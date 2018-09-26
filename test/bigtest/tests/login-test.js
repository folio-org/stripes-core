import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import LoginInteractor from '../interactors/login';

describe('Login', () => {
  const login = new LoginInteractor();

  setupApplication({ disableAuth: false });

  it('has username and password fields', () => {
    expect(login.username.isPresent).to.be.true;
    expect(login.password.isPresent).to.be.true;
  });

  it('has a disabled submit button', () => {
    expect(login.submit.isPresent).to.be.true;
    expect(login.submit.isDisabled).to.be.true;
  });

  describe('with invalid credentials', () => {
    it.always('does not log in');
    it('displays an error');
  });

  describe('with valid credentials', () => {
    it('logs in successfully');
    it('persists session data');
  });
});
