function replaceQueryResource(module, payload) {
  return {
    type: '@@stripes-connect/LOCAL_REPLACE',
    payload: Object.assign({ query: '' }, payload),
    meta: {
      module: module.module,
      resource: 'query',
      dataKey: module.dataKey,
    },
  };
}

// eslint-disable-next-line import/prefer-default-export
export { replaceQueryResource };
