// Returns a reducer function equivalent to the one passed in, except
// that it additional implements the 'RESET_STORE' action, which
// removes everything except the Okapi object from the store.

function enhanceReducer(reducer) {
  return (state, action) => {
    if (action.type === 'RESET_STORE') {
      console.log('interpreting RESET_STORE');
      return { okapi: state.okapi };
    } else {
      return reducer(state, action);
    }
  };
}

export default enhanceReducer;
