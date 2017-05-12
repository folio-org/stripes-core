function resetStore() {
  return {
    type: 'RESET_STORE',
  };
}

// We export a single named function rather than using a default
// export, to remain consistent with okapiActions.js
//
// eslint-disable-next-line import/prefer-default-export
export { resetStore };
