import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

import React, { Component } from 'react';

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

    it('has one installed app', function () {
      expect(about.installedApps()).to.have.lengthOf(1);
    });
  });
});
