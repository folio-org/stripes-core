import ReactDOM from 'react-dom';
import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';
import localforage from 'localforage';
import { reset } from '@folio/stripes-connect';

// load these styles for our tests
import '@folio/stripes-components/lib/global.css';

import startMirage from '../network/start';

import App from '../../../src/App';

import {
  withModules,
  clearModules,
  withConfig,
  clearConfig,
  setCookies,
  clearCookies,
} from './stripes-config';

const { assign } = Object;

export default function setupApplication({
  disableAuth = true,
  modules = [],
  translations = {},
  permissions = {},
  stripesConfig,
  mirageOptions = {},
  scenarios,
  currentUser = {},
  userLoggedIn = false,
  initialState = {},
  cookies = {},
} = {}) {
  const mountId = 'testing-root';

  beforeEach(async function () {
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
    } else {
      initialState.okapi = {
        ssoEnabled: true,
      };
    }

    // mount the app
    this.app = await setupAppForTesting(App, {
      mountId,

      props: {
        initialState,
        defaultTranslations: translations
      },

      setup: () => {
        this.server = startMirage(scenarios, mirageOptions);
        this.server.logging = false;

        if (userLoggedIn) {
          localforage.setItem('okapiSess', {
            token: initialState.okapi.token,
            user: initialState.okapi.currentUser,
            perms: initialState.okapi.currentPerms,
          });
        }

        setCookies(cookies);
        withModules(modules);
        withConfig({ logCategories: '', ...stripesConfig });
      },

      teardown: () => {
        clearConfig();
        clearModules();
        clearCookies(cookies);
        reset();
        localforage.clear();
        this.server?.shutdown();
        this.server = null;
        this.app = null;
      }
    });

    // set the root to 100% height
    document.getElementById(mountId).style.height = '100%';

    // setup react validators
    Object.defineProperties(this, {
      visit: { value: visit },
      location: { get: location },
    });
  });
}
