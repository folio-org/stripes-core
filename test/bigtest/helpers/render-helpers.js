import React from 'react';
import { setupAppForTesting } from './setupAppForTesting';

import Harness from './Harness';

// load these styles for our tests
import '@folio/stripes-components/lib/global.css';

/**
 * mount a component
 */
export async function mount(component) {
  const ComponentHarness = () => {
    return component;
  };

  await setupAppForTesting(ComponentHarness, {
    mountId: 'testing-root',
  });
}

/**
 * mount a component with contexts provided by redux-store
 * and react-intl.
 */
export async function mountWithContext(component) {
  await (mount(<Harness>{component}</Harness>));
}

export function selectorFromClassnameString(str) {
  return str.replace(/\s/, '.');
}
