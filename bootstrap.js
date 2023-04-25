import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './src/App';

export default function init() {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(<App />);
}
