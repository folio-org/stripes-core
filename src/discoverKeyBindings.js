export function discoverKeyBindings(okapiUrl, store) {
  // Hardwired version for now: get from mod-configuration later
  store.dispatch({
    type: 'LOADED_KEY_BINDINGS',
    bindings: {
      stripesHome: 'command+up',
      stripesAbout: 'command+down',
    },
  });
}

export function keyBindingsReducer(state = {}, action) {
  switch (action.type) {
    case 'LOADED_KEY_BINDINGS':
      return Object.assign({}, state, { bindings: action.bindings });
    default:
      return state;
  }
}
