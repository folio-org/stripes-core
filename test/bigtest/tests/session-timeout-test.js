import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-core-application';
import LoginInteractor from '../interactors/login';
import translations from '../../../translations/stripes-core/en';

describe('Session timeout test', () => {
  const login = new LoginInteractor('form[class^="form--"]');

  setupApplication({
    scenarios: ['invalidToken']
  });

  describe('clicking settings', () => {
    beforeEach(function () {
      this.visit('/settings/about');
    });

    it('should redirect to login with session timeout message', function () {
      expect(login.message.text).to.equal(translations['errors.user.timeout']);
    });
  });
});
