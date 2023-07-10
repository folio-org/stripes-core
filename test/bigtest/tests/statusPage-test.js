import { beforeEach, describe, it } from 'mocha';

import translations from '../../../translations/stripes-core/en';
import setupApplication from '../helpers/setup-core-application';
import { StatusPage as StatusPageInteractor } from '../interactors/common';

describe('Forgot username/password status test', () => {
  setupApplication({ disableAuth: false });

  beforeEach(function () {
    this.visit({
      pathname: '/check-email',
      state: { userEmail: '127-699-8925' }
    });
  });

  const statusPage = StatusPageInteractor();

  describe('check email status page tests', () => {
    it('should display a status page to the user', () => statusPage.exists());

    it(`should have the header with an appropriate text content
      equal to check email label in english translation`, () => {
      statusPage.has({ headerText: translations['label.check.email'] });
    });

    it(`should have the paragraph with an appropriate text content
      equal to sent email precautions label in english translation`,
    () => statusPage.has({ notificationText: translations['label.your.email'] }));

    it(`should have the paragraph with an appropriate text content
      equal to check email precautions label in english translation`,
    () => statusPage.has({ cautionText: translations['label.caution.email'] }));
  });
});
