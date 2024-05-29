import { describe, beforeEach, it } from 'mocha';

import React, { Component } from 'react';
import { converge } from '@folio/stripes-testing';
import setupApplication from '../helpers/setup-core-application';
import AboutInteractor from '../interactors/about';

describe('About', () => {
  const about = new AboutInteractor();

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

  describe('viewing the about page', () => {
    beforeEach(function () {
      this.visit('/settings/about');
    });

    it('has one installed app', () => converge(() => {
      if (!(about.installedApps().length === 1)) throw new Error(`expected ${about.installedApps().length} to be 1`);
    }));
  });
});
