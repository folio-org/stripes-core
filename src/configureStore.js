import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { epicMiddleware, addEpics } from '@folio/stripes-redux';

import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';
import connectErrorEpic from './connectErrorEpic';

export default function configureStore(initialState, config, stripesLogger) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => stripesLogger.hasCategory('redux'),
  });

  const reducer = enhanceReducer(combineReducers(initialReducers));
  const middleware = applyMiddleware(thunk, logger, epicMiddleware);

  addEpics([connectErrorEpic]);

  return createStore(reducer, initialState, middleware);
}
