import { describe, beforeEach, it } from 'mocha';
import { HTML } from '@folio/stripes-testing';

import setupApplication from '../helpers/setup-core-application';
import translations from '../../../translations/stripes-core/en';

// skip because RTR separates token- and API-requests so we can assume
// that any response to an API request is specific to that API, not
// to token validation.
describe.skip('Session timeout test', () => {
  const login = new LoginInteractor('form[class^="form--"]');

  setupApplication({
    scenarios: ['invalidToken']
  });

  describe('clicking settings', () => {
    beforeEach(function () {
      this.visit('/settings/about');
    });

    it('should redirect to login with session timeout message', () => HTML(translations['errors.user.timeout']).exists());
  });
});
