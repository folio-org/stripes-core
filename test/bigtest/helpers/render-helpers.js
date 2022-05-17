import React from 'react';
import ReactDOM from 'react-dom';
import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';

import App from '../../../src/App';
import {
  withModules,
  clearModules,
  withConfig,
  clearConfig,
  setCookies,
  clearCookies,
} from './stripes-config';

import Harness from './Harness';

// load these styles for our tests
import '@folio/stripes-components/lib/global.css';

import startMirage from '../network/start';


// DOM element ID to serve as a container for component being tested.
const testingRootId = 'root';

function getCleanTestingRoot() {
  let $root = document.getElementById(testingRootId);

  // if a root exists, unmount anything inside and remove it
  if ($root) {
    ReactDOM.unmountComponentAtNode($root);
    $root.parentNode.removeChild($root);
  }

  // create a brand new root element
  $root = document.createElement('div');
  $root.id = testingRootId;

  document.body.appendChild($root);

  return $root;
}

export async function mount(component) {
  const ComponentHarness = () => {
    return component;
  };

  await setupAppForTesting(ComponentHarness, {
    mountId: 'testing-root',
  });

  // set the root to 100% height
  document.getElementById('testing-root').style.height = '100%';
}


export async function mountWithContext(component) {
  await (mount(<Harness>{component}</Harness>));
}

/**
 * if a root exists, unmount anything inside and remove it
 */
export function unmount() {
  return;
  const $root = document.getElementById(testingRootId);
  if ($root) {
    ReactDOM.unmountComponentAtNode($root);
    $root.parentNode.removeChild($root);
  }
}

export function selectorFromClassnameString(str) {
  return str.replace(/\s/, '.');
}
