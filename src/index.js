import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { okapi, config } from 'stripes-loader'; // eslint-disable-line
import configureLogger from './configureLogger';
import configureStore from './configureStore';
import Root from './Root';

const initialState = { okapi };
const logger = configureLogger(config);
logger.log('core', 'Starting Stripes ...');
const store = configureStore(initialState, config, logger);

render(
  <Root store={store} logger={logger} okapi={okapi} disableAuth={(config && config.disableAuth) || false} />,
  document.getElementById('root'),
);
