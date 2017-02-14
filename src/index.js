import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { okapi, config } from 'stripes-loader'; // eslint-disable-line
import configureStore from './configureStore';
import Root from './Root';

const initialState = { okapi };
const store = configureStore(initialState, config);

render(
  <Root store={store} disableAuth={(config && config.disableAuth) || false} />,
  document.getElementById('root'),
);
