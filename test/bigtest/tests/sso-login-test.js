import React from 'react';
import { expect } from 'chai';
import { beforeEach, it, describe } from 'mocha';
import { HTML } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-core-application';
// import SSOLandingInteractor from '../interactors/SSOLanding';


const SSOLandingInteractor = HTML.extend('sso landing')
  .selector('div[tabindex="-1"]')
  .filters({
    error: el => el.matches('[data-test-sso-error]'),
    valid: el => el.matches('[data-test-sso-success]')
  });

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
    const sso = SSOLandingInteractor();

    describe('Renders error without token', () => {
      setupApplication({
        disableAuth: false,
      });
      beforeEach(async function () {
        await this.visit('/sso-landing');
      });

      it('Shows error message', () => sso.has({ error: true }));

      it('Does not show token message', () => sso.has({ valid: false }));
    });

    describe('Reads token in params', () => {
      setupApplication({
        disableAuth: false,
      });

      beforeEach(async function () {
        await this.visit('/sso-landing?ssoToken=c0ffee');
      });

      it('Shows token message', () => sso.has({ valid: true }));
    });

    describe('Reads token in cookie', () => {
      setupApplication({
        disableAuth: false,
        cookies: { ssoToken: 'c0ffee-c0ffee' },
      });

      beforeEach(async function () {
        await this.visit('/sso-landing');
      });

      it('Shows token message', () => sso.has({ valid: true }));
    });
  });
});
