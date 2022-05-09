import React from 'react';
import ReactDOM from 'react-dom';
import Harness from './Harness';

import '@folio/stripes-components/lib/global.css';

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

export function mount(component) {
  return new Promise(resolve => {
    ReactDOM.render(component, getCleanTestingRoot(), resolve);
  });
}

export function mountWithContext(component) {
  return new Promise(resolve => {
    ReactDOM.render(<Harness>{component}</Harness>, getCleanTestingRoot(), resolve);
  });
}

/**
 * if a root exists, unmount anything inside and remove it
 */
export function unmount() {
  const $root = document.getElementById(testingRootId);
  if ($root) {
    ReactDOM.unmountComponentAtNode($root);
    $root.parentNode.removeChild($root);
  }
}

export function selectorFromClassnameString(str) {
  return str.replace(/\s/, '.');
}
