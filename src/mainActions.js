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

export {
  resetStore,
  destroyStore,
  actionTypes,
};
