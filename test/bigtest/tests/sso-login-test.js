import { expect } from 'chai';
import { beforeEach, afterEach, it, describe } from '@bigtest/mocha';
import localforage from 'localforage';
import { when } from '@bigtest/convergence';
import setupApplication from '../helpers/setup-core-application';
import SSOLandingInteractor from '../interactors/SSOLanding';

// These are SSO route-based tests. There are also component-based tests
// at / src / components / SSOLogin / tests /
//
// BigTest OG first runs tests in /src (which are all component-based tests
// and therefore only call mount) and then the tests in /tests (which are all
// route-based tests and therefore call setupApplication or one of its
// derivatives). The two types don't play nice together because of they way
// the do (or don't) clean up their mount points after running.
//
describe('Login via SSO', () => {
  describe('SSO redirect', () => {
    const sso = new SSOLandingInteractor();

    describe('Reads token in params', () => {
      setupApplication({
        disableAuth: false,
        mirageOptions: {
          timing: 1000
        }
      });

      beforeEach(async function () {
        this.visit('/sso-landing?ssoToken=c0ffee');
      });

      afterEach(async () => {
        await localforage.clear();
      });

      it.only('Shows token message', () => {
        console.log('checking for sso message');
        expect(sso.isValid).to.be.true;
      });
    });

    describe('Reads token in cookie', () => {
      setupApplication({
        disableAuth: false,
        cookies: { ssoToken: 'c0ffee-c0ffee' },
      });

      beforeEach(async function () {
        await localforage.clear();
        this.visit('/sso-landing');
        await when(() => (document.getElementById('sso-screen') !== null));
      });

      afterEach(async () => {
        await localforage.clear();
      });

      it('Shows token message', () => {
        expect(sso.isValid).to.be.true;
      });
    });

    describe('Renders error without token', () => {
      setupApplication({
        disableAuth: false,
      });

      beforeEach(async function () {
        await localforage.clear();
        this.visit('/sso-landing');
        await when(() => (document.getElementById('sso-screen') !== null));
      });

      afterEach(async () => {
        await localforage.clear();
      });

      it('Shows error message', () => {
        expect(sso.isError).to.be.true;
      });

      it('Does not show token message', () => {
        expect(sso.isValid).to.be.false;
      });
    });
  });
});
