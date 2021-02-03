import React from 'react';
import { expect } from 'chai';
import { beforeEach, it, describe } from '@bigtest/mocha';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

import setupApplication from '../helpers/setup-core-application';
import Harness from '../helpers/Harness';
import { mount } from '../helpers/render-helpers';
import SSOLogin from '../../../src/components/SSOLogin';
import translations from '../../../translations/stripes-core/en';
import SSOLandingInteractor from '../interactors/SSOLanding';

describe('Login via SSO', () => {
  describe('SSO form presentation', () => {
    const ssoLoginButton = new ButtonInteractor('[data-test-sso-login-button]');
    let clicked = false;

    beforeEach(async () => {
      await mount(
        <Harness>
          <SSOLogin handleSSOLogin={() => { clicked = true; }} />
        </Harness>
      );
    });

    it('button should be rendered', () => {
      expect(ssoLoginButton.isPresent).to.be.true;
      expect(ssoLoginButton.isButton).to.be.true;
    });

    it('text should be rendered as label of button', () => {
      expect(ssoLoginButton.text).to.equal(translations.loginViaSSO);
    });

    describe('clicking the SSO Login button', () => {
      beforeEach(async () => {
        await ssoLoginButton.click();
      });

      it('should trigger handleSSOLogin callback', () => {
        expect(clicked).to.be.true;
      });
    });
  });

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
