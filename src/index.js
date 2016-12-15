import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import configureStore from './configureStore';
import Root from './Root';
import { okapi } from 'stripes-loader!'; // eslint-disable-line

const initialState = { okapi };
const store = configureStore(initialState);

render(
  <Root store={store} />,
  document.getElementById('root'),
);
