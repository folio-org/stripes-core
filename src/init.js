import 'core-js/stable';
import 'regenerator-runtime/runtime';
import React from 'react';
import { createRoot } from 'react-dom/client';
import localforage from 'localforage';

import { okapi as okapiConfig } from 'stripes-config';

import { registerServiceWorker } from './serviceWorkerRegistration';
import App from './App';

export default function init() {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<App />);
  registerServiceWorker(okapiConfig.url, localforage);
}
