// Returns a reducer function equivalent to the one passed in, except
// that it additionally implements the 'RESET_STORE' action, which
// removes everything except the Okapi object from the store.

function enhanceReducer(reducer) {
  return (state, action) =>
    ((action.type === 'RESET_STORE') ? { okapi: state.okapi } : reducer(state, action));
}

export default enhanceReducer;
