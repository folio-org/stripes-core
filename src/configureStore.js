import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import initialReducers from './initialReducers';

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
  const enhancedReducer = (state, action) => {
    if (action.type === 'RESET_STORE') {
      console.log('interpreting RESET_STORE');
      return { okapi: state.okapi };
    } else {
      return reducer(state, action);
    }
  };
  const store = finalCreateStore(enhancedReducer, initialState);

  return store;
}
