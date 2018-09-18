import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';
import localforage from 'localforage';
import startMirage from '../network/start';

import App from '../../../src/App';

// load these styles for our tests
import 'typeface-source-sans-pro';
import '@folio/stripes-components/lib/global.css';

import { withModules, clearModules } from './stripes-config';

export default function setupApplication({
  disableAuth = true,
  modules = [],
  scenarios
} = {}) {
  beforeEach(async function () {
    this.app = await setupAppForTesting(App, {
      mountId: 'testing-root',

      props: {
        disableAuth
      },

      setup: () => {
        this.server = startMirage(scenarios);
        this.server.logging = false;
        withModules(modules);
      },

      teardown: () => {
        this.server.shutdown();
        localforage.clear();
        clearModules();
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
