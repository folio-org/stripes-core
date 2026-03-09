// Returns a reducer function equivalent to the one passed in, except
// that it additionally implements the 'RESET_STORE' action, which
// removes everything except the Config object, Okapi object, and discovery
// information from the store.

function enhanceReducer(reducer) {
  return (state, action) => {
    const { config, okapi, discovery } = state;

    switch (action.type) {
      case 'RESET_STORE':
        return {
          config,
          okapi,
          discovery,
        };
      case 'DESTROY_STORE':
        return {
          config: {},
          okapi: {},
        };
      default:
        return reducer(state, action);
    }
  };
}

export default enhanceReducer;
