// Returns a reducer function equivalent to the one passed in, except
// that it additionally implements the 'RESET_STORE' action, which
// removes everything except the Okapi object and discovery
// information from the store.

function enhanceReducer(reducer) {
  return (state, action) =>
    (action.type !== 'RESET_STORE' ? reducer(state, action) :
      {
        okapi: state.okapi,
        discovery: state.discovery,
      }
    );
}

export default enhanceReducer;
