const RESET_STORE = 'RESET_STORE';
const DESTROY_STORE = 'DESTROY_STORE';

const actionTypes = {
  RESET_STORE,
  DESTROY_STORE,
};

function resetStore() {
  return {
    type: RESET_STORE,
  };
}

function destroyStore() {
  return {
    type: DESTROY_STORE,
  };
}

// We export a single named function rather than using a default
// export, to remain consistent with okapiActions.js
//
// eslint-disable-next-line import/prefer-default-export
export {
  resetStore,
  destroyStore,
  actionTypes,
};
