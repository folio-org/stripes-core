const connectErrorEpic = action$ => action$
  .ofType('@@stripes-connect/FETCH_ERROR', '@@stripes-connect/MUTATION_ERROR')
  .map((action) => {
    const { meta, payload: e } = action;
    const op = action.type === '@@stripes-connect/FETCH_ERROR' ? 'GET' : e.type;
    // eslint-disable-next-line prefer-template,no-alert
    window.alert(`ERROR: in module ${meta.module}, operation ${op}`
      + ` on resource '${meta.resource}' failed`
      + (action.payload.status ? ` with HTTP status ${e.status}` : '')
      + (e.message ? `, saying: ${e.message}` : ''));

    // TODO: When we have a more complete notification system and present our errors
    // through it this will better follow the redux-observable pattern of emitting
    // another action.
    return { type: '@@stripes-core/CREATE_NOTIFICATION' };
  });

export default connectErrorEpic;
