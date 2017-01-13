import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import initialReducers from './initialReducers';


const logger = createLogger({
  predicate: function(action) {
    const show = window.reduxLog;
    // Show loggig, unless explicitly set false
    return show === undefined || show;
  },
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
