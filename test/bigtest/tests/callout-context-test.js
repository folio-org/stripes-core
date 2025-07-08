import React, { Component, useContext } from 'react';

import { describe, beforeEach, it } from 'mocha';
import {
  Callout as CalloutInteractor,
  HTML,
  Link
} from '@folio/stripes-testing';

import { CalloutContext } from '../../../src/CalloutContext';
import setupApplication from '../helpers/setup-core-application';
import always from '../helpers/always';

const HookApp = () => {
  const callout = useContext(CalloutContext);
  callout.sendCallout({ message: 'Hook', type: 'success' });
  return <h1>Hook App</h1>;
};


// local until appList interactor is exported from `@folio/stripes-testing`
export const AppListInteractor = HTML.extend('App List')
  .selector('[data-test-app-list]')
  .actions({
    choose: ({ find }, linkText) => find(Link(linkText)).click(),
  });

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
  const app = AppListInteractor();
  const callout = CalloutInteractor();

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
      await app.choose('Hook');
    });

    it('shows a success callout', () => callout.is({ type: 'success' }));

    describe('navigating to another app that shows no callouts', () => {
      beforeEach(async () => {
        await app.choose('No Callout');
      });

      it('continues to show the previous success callout', () => always(CalloutInteractor({ type: 'success' }).exists));
    });
  });

  describe('navigating to the Context app that shows an error Callout', () => {
    beforeEach(async () => {
      await app.choose('Context');
    });

    it('shows a error callout', () => CalloutInteractor({ type: 'error' }).exists());

    describe('navigating to another app that shows no callouts', () => {
      beforeEach(async () => {
        await app.choose('No Callout');
      });

      it('continues to show the previous error callout', () => always(CalloutInteractor({ type: 'error' }).exists));
    });
  });
});
