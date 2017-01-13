import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import initialReducers from './initialReducers';


const logger = createLogger({
  // Show logging unless explicitly set false
  predicate: () => window.reduxLog === undefined || window.reduxLog,
});

export default function configureStore(initialState) {
  const finalCreateStore = compose(
    applyMiddleware(thunk),
    applyMiddleware(logger),
  )(createStore);

  const reducer = combineReducers(initialReducers);
  const store = finalCreateStore(reducer, initialState);

  return store;
}
