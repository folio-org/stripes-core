import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import configureStore from './configureStore';
import Root from './Root';

// global styles need an explicit loader to be exempt from the 
// local-scoping of the default loader configuration
//import '!style!css!postcss!../styles/global.css';

const store = configureStore();

render(
  <Root store={store} />,
  document.getElementById('root')
);
