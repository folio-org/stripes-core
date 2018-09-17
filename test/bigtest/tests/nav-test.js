import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import AppInteractor from '../interactors/app';

describe('Nav', () => {
  const app = new AppInteractor();

  setupApplication();

  it('shows a settings button', () => {
    expect(app.nav('Settings').isPresent).to.be.true;
  });

  describe('clicking settings', () => {
    beforeEach(async () => {
      await app.nav('Settings').click();
    });

    it('navigates to /settings', function () {
      expect(this.location.pathname).to.equal('/settings');
    });
  });
});
