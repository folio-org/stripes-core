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
        // this makes the return immediate which speeds up tests. We can remove this when we
        // work up a solid NODE_ENV=='test' workflow.
        this.server.timing = 0;

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
      location: { get: location },
    });
  });
}
