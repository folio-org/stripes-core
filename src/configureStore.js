import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import initialReducers from './initialReducers';
import enhanceReducer from './enhanceReducer';

export default function configureStore(initialState, config, stripesLogger) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => stripesLogger.hasCategory('redux'),
  });

  const finalCreateStore = compose(
    applyMiddleware(thunk),
    applyMiddleware(logger),
  )(createStore);

  const reducer = combineReducers(initialReducers);
  const store = finalCreateStore(enhanceReducer(reducer), initialState);

  return store;
}
