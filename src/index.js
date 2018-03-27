import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { okapi as okapiConfig, config } from 'stripes-config'; // eslint-disable-line

import connectErrorEpic from './connectErrorEpic';
import configureEpics from './configureEpics';
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import { discoverServices } from './discoverServices';
import gatherActions from './gatherActions';

import Root from './components/Root';

const okapi = (typeof okapiConfig === 'object' && Object.keys(okapiConfig).length > 0)
  ? okapiConfig
  : { withoutOkapi: true };
const initialState = { okapi };
const epics = configureEpics(connectErrorEpic);
const logger = configureLogger(config);
logger.log('core', 'Starting Stripes ...');
const store = configureStore(initialState, logger, epics);
if (!okapi.withoutOkapi) discoverServices(store);
const actionNames = gatherActions();

render(
  <Root store={store} epics={epics} logger={logger} config={config} actionNames={actionNames} disableAuth={(config && config.disableAuth) || false} />,
  document.getElementById('root'),
);
