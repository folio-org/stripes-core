import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { epicMiddleware, addEpics } from '@folio/stripes-redux';

import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';
import connectErrorEpic from './connectErrorEpic';

export default function configureStore(initialState, config, stripesLogger) {
  let createStoreWithMiddleware;
  const reducer = enhanceReducer(combineReducers(initialReducers));
  const middleware = applyMiddleware(thunk, epicMiddleware);
 /* eslint-disable no-underscore-dangle */
  if (stripesLogger.hasCategory('redux')) {
    createStoreWithMiddleware = compose(
    middleware,
      window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    );
  } else {
    createStoreWithMiddleware = compose(middleware);
  }
  /* eslint-enable */

  addEpics([connectErrorEpic]);

  return createStoreWithMiddleware(createStore)(reducer, initialState, middleware);
}
