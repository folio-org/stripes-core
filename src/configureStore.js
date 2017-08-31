import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';

export default function configureStore(initialState, stripesLogger, epics) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => stripesLogger.hasCategory('redux'),
  });
  const reducer = enhanceReducer(combineReducers(initialReducers));
  const middleware = applyMiddleware(thunk, logger, epics.middleware);
 /* eslint-disable no-underscore-dangle */
  const createStoreWithMiddleware = compose(
    middleware,
      window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f,
    );
  /* eslint-enable */

  return createStoreWithMiddleware(createStore)(reducer, initialState, middleware);
}
