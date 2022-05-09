import React from 'react';
import { expect } from 'chai';
import { beforeEach, it, describe } from '@bigtest/mocha';

import setupApplication from '../helpers/setup-core-application';
import SSOLandingInteractor from '../interactors/SSOLanding';

// Why is this file named aaa-sso-login-test?
//
// BigTest OG first runs tests in /src (which are all component-based tests
// and therefore only call mount) and then the tests in /tests (which are all
// route-based tests and therefore call setupApplication or one of its
// derivatives).
//
// The SSO tests leverage both mount (to directly test individual
// components) and setupApplication (to test the DOM when mounted at
// particular routes).
//
describe('Login via SSO', () => {
  describe('SSO redirect', () => {
    const sso = new SSOLandingInteractor();

    describe('Renders error without token', () => {
      setupApplication({
        disableAuth: false,
      });
      beforeEach(async function () {
        this.visit('/sso-landing');
      });

      it('Shows error message', () => {
        expect(sso.isError).to.be.true;
      });

      it('Does not show token message', () => {
        expect(sso.isValid).to.be.false;
      });
    });

    describe('Reads token in params', () => {
      setupApplication({
        disableAuth: false,
      });

      beforeEach(async function () {
        this.visit('/sso-landing?ssoToken=c0ffee');
      });

      it('Shows token message', () => {
        expect(sso.isValid).to.be.true;
      });
    });

    describe('Reads token in cookie', () => {
      setupApplication({
        disableAuth: false,
        cookies: { ssoToken: 'c0ffee-c0ffee' },
      });

      beforeEach(async function () {
        this.visit('/sso-landing');
      });

      it('Shows token message', () => {
        expect(sso.isValid).to.be.true;
      });
    });
  });
});
