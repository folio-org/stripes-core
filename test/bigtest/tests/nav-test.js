import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import React, { Component } from 'react';

import setupApplication from '../helpers/setup-core-application';
import AppInteractor from '../interactors/app';

describe('Nav', () => {
  const app = new AppInteractor();

  class DummyApp extends Component {
    render() {
      return (<h1>Hello Stripes!</h1>);
    }
  }

  setupApplication({
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      hasSettings: true,
      module: DummyApp
    }],
    translations: {
      'dummy.title': 'Dummy'
    }
  });

  it('shows a settings button', () => {
    expect(app.nav('Settings').isPresent).to.be.true;
  });

  it('shows a dummy app button', () => {
    expect(app.nav('Dummy').isPresent).to.be.true;
  });

  it('shows help button', function () {
    expect(app.helpButton.isPresent).to.be.true;
  });

  describe('clicking settings', () => {
    beforeEach(async () => {
      await app.nav('Settings').click();
    });

    it('navigates to /settings', function () {
      expect(this.location.pathname).to.equal('/settings');
    });
  });

  describe('clicking the dummy app', () => {
    beforeEach(async () => {
      await app.nav('Dummy').click();
    });

    it('navigates to the dummy route', function () {
      expect(this.location.pathname).to.equal('/dummy');
    });
  });
});
