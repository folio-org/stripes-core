import React from 'react';
import { expect } from 'chai';
import { beforeEach, it, describe } from '@bigtest/mocha';
import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

import Harness from '../../../../test/bigtest/helpers/Harness';
import { mount } from '../../../../test/bigtest/helpers/render-helpers';
import SSOLogin from '..';
import translations from '../../../../translations/stripes-core/en';

// These are SSO component-based tests. There are also route-based tests
// at /test/bigtest/tests/sso-login-test.js.
//
// BigTest OG first runs tests in /src (which are all component-based tests
// and therefore only call mount) and then the tests in /tests (which are all
// route-based tests and therefore call setupApplication or one of its
// derivatives). The two types don't play nice together because of they way
// the do (or don't) clean up their mount points after running.
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
});
