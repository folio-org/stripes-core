import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';
import localforage from 'localforage';
import sinon from 'sinon';

// load these styles for our tests
import 'typeface-source-sans-pro';
import '@folio/stripes-components/lib/global.css';

import startMirage from '../network/start';

import App from '../../../src/App';
import * as actions from '../../../src/okapiActions';

import {
  withModules,
  clearModules,
  withConfig,
  clearConfig
} from './stripes-config';

export default function setupApplication({
  disableAuth = true,
  modules = [],
  translations = {},
  permissions = {},
  stripesConfig,
  mirageOptions,
  scenarios
} = {}) {
  beforeEach(async function () {
    const initialState = {};

    // when auth is disabled, add a fake user to the store
    if (disableAuth) {
      initialState.okapi = {
        token: 'test',
        currentUser: {
          id: 'test',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@folio.org',
          addresses: [],
          servicePoints: []
        },
        currentPerms: {
          'perms.all': true,
          ...permissions
        }
      };
    }

    // mount the app
    this.app = await setupAppForTesting(App, {
      mountId: 'testing-root',

      props: {
        initialState
      },

      setup: () => {
        this.server = startMirage(scenarios, mirageOptions);
        this.server.logging = false;

        withModules(modules);
        withConfig({ logCategories: '', ...stripesConfig });

        sinon.stub(actions, 'setTranslations').callsFake(incoming => {
          return {
            type: 'SET_TRANSLATIONS',
            translations: Object.assign(incoming, translations)
          };
        });
      },

      teardown: () => {
        actions.setTranslations.restore();
        clearConfig();
        clearModules();
        localforage.clear();
        this.server.shutdown();
      }
    });

    // set the root to 100% height
    document.getElementById('testing-root').style.height = '100%';

    // setup react helpers
    Object.defineProperties(this, {
      visit: { value: visit },
      location: { get: location }
    });
  });
}
