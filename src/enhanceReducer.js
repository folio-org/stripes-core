// Returns a reducer function equivalent to the one passed in, except
// that it additionally implements the 'RESET_STORE' action, which
// removes everything except the Okapi object and discovery
// information from the store.

function enhanceReducer(reducer) {
  return (state, action) => {
    const { okapi, discovery } = state;

    switch (action.type) {
      case 'RESET_STORE':
        return {
          okapi,
          discovery,
        };
      case 'DESTROY_STORE':
        return {
          okapi: {},
        };
      default:
        return reducer(state, action);
    }
  };
}

export default enhanceReducer;
