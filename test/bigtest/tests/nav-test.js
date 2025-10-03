import { describe, beforeEach, it } from 'mocha';
import { expect } from 'chai';

import React, { Component } from 'react';
import { Button } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-core-application';
import { AppListInteractor } from '../interactors/app';

describe('Nav', () => {
  const nav = new AppListInteractor();

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

  it('shows a settings button', () => Button('Settings').exists());

  it('shows a dummy app button', () => Button('Dummy').exists());

  it('shows help button', () => Button({ id: 'helpButton' }).exists());

  describe('clicking settings', () => {
    beforeEach(async () => {
      await nav.choose('Settings');
    });

    it('navigates to /settings', function () {
      expect(this.location.pathname).to.equal('/settings');
    });
  });

  describe('clicking the dummy app', () => {
    beforeEach(async () => {
      await nav.choose('Dummy');
    });

    it('navigates to the dummy route', function () {
      expect(this.location.pathname).to.equal('/dummy');
    });
  });
});
