import ReactDOM from 'react-dom';
import { beforeEach } from 'mocha';
import localforage from 'localforage';

import { reset } from '@folio/stripes-connect';
import { visit, location } from '@folio/stripes-testing/bigtest';

// load these styles for our tests
import '@folio/stripes-components/lib/global.css';

import { setupAppForTesting } from './setupAppForTesting';
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
        ...initialState.okapi,
        currentUser: assign({
          id: 'test',
          username: 'testuser',
          firstName: 'Test',
          lastName: 'User',
          email: 'user@folio.org',
          addresses: [],
          servicePoints: []
        }, currentUser),
        currentPerms: permissions,
        isAuthenticated: true,
      };
      initialState.discovery = {
        ...initialState.discovery,
        isFinished: true,
      };
    } else {
      initialState.okapi = {
        ...initialState.okapi,
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
            isAuthenticated: true,
            user: initialState.okapi.currentUser,
            perms: initialState.okapi.currentPerms,
            tenant: 'tenant',
            tokenExpiration: {
              atExpires: Date.now() + (10 * 60 * 1000),
              rtExpires: Date.now() + (10 * 60 * 1000),
            },
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
        this.server?.shutdown();
        this.server = null;
        this.app = null;
      }
    });

    // setup react validators
    Object.defineProperties(this, {
      visit: { value: visit },
      location: { get: location },
    });
  });

  afterEach(async () => {
    await localforage.clear();
  });
}
