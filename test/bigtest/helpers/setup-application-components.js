import { beforeEach } from '@bigtest/mocha';

import setupStripesCore from './setup-application';
import {
  withModules,
  clearModules,
} from './stripes-config';
import mirageOptions from '../network';

export default function setupApplication({
  scenarios
} = {}) {
  setupStripesCore({
    mirageOptions,
    scenarios,

    // setup a dummy app for smart components
    modules: [{
      type: 'app',
      name: '@folio/ui-dummy',
      displayName: 'dummy.title',
      route: '/dummy',
      module: null
    }],

    translations: {
      'dummy.title': 'Dummy'
    }
  });

  // go to the dummy app where smart components are mounted
  beforeEach(function () { // eslint-disable-line func-names
    this.visit('/dummy');
  });
}

// replace the dummy app to mount the component
export function mount(component) {
  clearModules();

  withModules([{
    type: 'app',
    name: '@folio/ui-dummy',
    displayName: 'dummy.title',
    route: '/dummy',
    module: () => component
  }]);
}
