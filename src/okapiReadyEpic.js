const okapiReadyEpic = action$ => action$
  .ofType('SET_BINDINGS', 'CHECK_SSO', 'AUTH_FAILURE')
  .map(() => ({ type: 'OKAPI_READY' }));

export default okapiReadyEpic;
