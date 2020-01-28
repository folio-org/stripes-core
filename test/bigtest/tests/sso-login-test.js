import React from 'react';
import { IntlProvider } from 'react-intl';
import { expect } from 'chai';
import { beforeEach, it, describe } from '@bigtest/mocha';

import ButtonInteractor from '@folio/stripes-components/lib/Button/tests/interactor';

import { mount } from '../helpers/render-helpers';
import SSOLogin from '../../../src/components/SSOLogin';

describe('Login via SSO', () => {
  const ssoLoginButton = new ButtonInteractor('[data-test-sso-login-button]');
  let clicked = false;

  beforeEach(async () => {
    await mount(
      <IntlProvider locale="en">
        <SSOLogin handleSSOLogin={() => { clicked = true; }} />
      </IntlProvider>
    );
  });

  it('button should be rendered', () => {
    expect(ssoLoginButton.isPresent).to.be.true;
    expect(ssoLoginButton.isButton).to.be.true;
  });

  it('text should be rendered as label of button', () => {
    expect(ssoLoginButton.text).to.equal('stripes-core.loginViaSSO');
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
