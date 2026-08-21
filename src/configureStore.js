import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';

const enhanceMiddleware = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-underscore-dangle

export default function configureStore(initialState, stripesLogger, epics) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => stripesLogger.hasCategory('redux'),
  });
  const { middleware: epicMiddleware, rootEpic } = epics;
  const reducer = enhanceReducer(combineReducers(initialReducers));
  const middleware = enhanceMiddleware(applyMiddleware(thunk, logger, epicMiddleware));
  const store = createStore(reducer, initialState, middleware);

  epicMiddleware.run(rootEpic);

  return store;
}
