import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import configureStore from './configureStore';
import Root from './Root';

// Stylesheets are stored in webpack/global.css via extract-text-webpack-plugin
import '../styles/global.sass';

const store = configureStore();

render(
  <Root store={store} />,
  document.getElementById('root')
);
