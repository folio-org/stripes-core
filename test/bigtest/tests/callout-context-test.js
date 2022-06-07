import React, { Component, useContext } from 'react';

import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';


import CalloutInteractor from '@folio/stripes-components/lib/Callout/tests/interactor';

import { CalloutContext } from '../../../src/CalloutContext';
import setupApplication from '../helpers/setup-core-application';
import AppInteractor from '../interactors/app';

const HookApp = () => {
  const callout = useContext(CalloutContext);
  callout.sendCallout({ message: 'Hook', type: 'success' });
  return <h1>Hook App</h1>;
};

class ContextApp extends Component {
  static contextType = CalloutContext;

  componentDidMount() {
    this.context.sendCallout({ message: 'Context', type: 'error' });
  }

  render() {
    return <h1>Context App</h1>;
  }
}

const CalloutFreeApp = () => <h1>No Callouts!</h1>;

describe('CalloutContext', () => {
  const app = new AppInteractor();
  const callout = new CalloutInteractor();

  setupApplication({
    modules: [{
      type: 'app',
      name: '@folio/ui-hook',
      displayName: 'hook.title',
      route: '/hook',
      module: HookApp
    }, {
      type: 'app',
      name: '@folio/ui-context',
      displayName: 'context.title',
      route: '/context',
      module: ContextApp
    }, {
      type: 'app',
      name: '@folio/ui-nocallout',
      displayName: 'nocallout.title',
      route: '/nocallout',
      module: CalloutFreeApp
    }],
    translations: {
      'hook.title': 'Hook',
      'context.title': 'Context',
      'nocallout.title': 'No Callout',
    }
  });

  describe('navigating to the Hook app that shows a success Callout', () => {
    beforeEach(async () => {
      await app.nav('Hook').click();
    });

    it('shows a success callout', () => {
      expect(callout.successCalloutIsPresent).to.be.true;
    });

    describe('navigating to another app that shows no callouts', () => {
      beforeEach(async () => {
        await app.nav('No Callout').click();
      });

      it('continues to show the previous success callout', () => {
        expect(callout.successCalloutIsPresent).to.be.true;
      });
    });
  });

  describe('navigating to the Context app that shows an error Callout', () => {
    beforeEach(async () => {
      await app.nav('Context').click();
    });

    it('shows a error callout', () => {
      expect(callout.errorCalloutIsPresent).to.be.true;
    });

    describe('navigating to another app that shows no callouts', () => {
      beforeEach(async () => {
        await app.nav('No Callout').click();
      });

      it('continues to show the previous error callout', () => {
        expect(callout.errorCalloutIsPresent).to.be.true;
      });
    });
  });
});
