import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';
import localforage from 'localforage';

// load these styles for our tests
import '@folio/stripes-components/lib/global.css';

import startMirage from '../network/start';

import App from '../../../src/App';

import {
  withModules,
  clearModules,
  withConfig,
  clearConfig
} from './stripes-config';

const { assign } = Object;

export default function setupApplication({
  disableAuth = true,
  modules = [],
  translations = {},
  permissions = {},
  stripesConfig,
  mirageOptions,
  scenarios,
  currentUser = {},
} = {}) {
  beforeEach(async function () {
    const initialState = {};

    // when auth is disabled, add a fake user to the store
    if (disableAuth) {
      initialState.okapi = {
        token: 'test',
        currentUser: assign({
          id: 'test',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@folio.org',
          addresses: [],
          servicePoints: []
        }, currentUser),
        currentPerms: permissions
      };
    }

    // mount the app
    this.app = await setupAppForTesting(App, {
      mountId: 'testing-root',

      props: {
        initialState,
        defaultTranslations: translations
      },

      setup: () => {
        this.server = startMirage(scenarios, mirageOptions);
        this.server.logging = false;

        withModules(modules);
        withConfig({ logCategories: '', ...stripesConfig });
      },

      teardown: () => {
        clearConfig();
        clearModules();
        localforage.clear();
        this.server.shutdown();
        this.server = null;
        this.app = null;
      }
    });

    // set the root to 100% height
    document.getElementById('testing-root').style.height = '100%';

    // setup react validators
    Object.defineProperties(this, {
      visit: { value: visit },
      location: { get: location }
    });
  });
}
