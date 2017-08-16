import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { okapi, config } from 'stripes-loader'; // eslint-disable-line

import epics from './epics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import { discoverServices } from './discoverServices';
import gatherActions from './gatherActions';

import Root from './Root';

const initialState = { okapi };
const logger = configureLogger(config);
logger.log('core', 'Starting Stripes ...');
const store = configureStore(initialState, logger);
discoverServices(okapi.url, store);
const actionNames = gatherActions();

render(
  <Root store={store} epics={epics} logger={logger} config={config} okapi={okapi} actionNames={actionNames} disableAuth={(config && config.disableAuth) || false} />,
  document.getElementById('root'),
);
