import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import initialReducers from './initialReducers';

export default function configureStore(initialState, config, stripesLogger) {
  const logger = createLogger({
    // Show logging unless explicitly set false
    predicate: () => {
      // XXX should change to check stripesLogger->hasCategory('redux')
      let res = window.reduxLog;
      if (res === undefined && config) res = config.reduxLog;
      if (res !== undefined) return res;
      return true; // Default default if neither global variable nor config item is set.
    },
  });

  const finalCreateStore = compose(
    applyMiddleware(thunk),
    applyMiddleware(logger),
  )(createStore);

  const reducer = combineReducers(initialReducers);
  const store = finalCreateStore(reducer, initialState);

  return store;
}
