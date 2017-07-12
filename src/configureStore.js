import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import sideEffects from '@folio/stripes-connect';

import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';

export default function configureStore(initialState, config, stripesLogger) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => stripesLogger.hasCategory('redux'),
  });

  const reducer = enhanceReducer(combineReducers(initialReducers));
  const middleware = applyMiddleware(thunk, logger, sideEffects.middleware);
  return createStore(reducer, initialState, middleware);
}
