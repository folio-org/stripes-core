import { describe, beforeEach, it } from 'mocha';
import { HTML } from '@folio/stripes-testing';

import setupApplication from '../helpers/setup-core-application';
import translations from '../../../translations/stripes-core/en';

describe('Session timeout test', () => {
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
