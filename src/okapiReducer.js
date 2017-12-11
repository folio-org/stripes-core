

export default function okapiReducer(state = {}, action) {
  switch (action.type) {
    case 'SET_OKAPI_TOKEN':
      return Object.assign({}, state, { token: action.token });
    case 'CLEAR_OKAPI_TOKEN':
      return Object.assign({}, state, { token: null });
    case 'SET_CURRENT_USER':
      return Object.assign({}, state, { currentUser: action.currentUser });
    case 'SET_LOCALE':
      return Object.assign({}, state, { locale: action.locale });
    case 'SET_PLUGINS':
      return Object.assign({}, state, { plugins: action.plugins });
    case 'SET_SINGLE_PLUGIN':
      return Object.assign({}, state, { plugins: Object.assign({}, state.plugins, { [action.name]: action.value }) });
    case 'SET_BINDINGS':
      return Object.assign({}, state, { bindings: action.bindings });
    case 'SET_CURRENT_PERMS':
      return Object.assign({}, state, { currentPerms: action.currentPerms });
    case 'CLEAR_CURRENT_USER':
      return Object.assign({}, state, { currentUser: {}, currentPerms: {} });
    case 'AUTH_FAILURE':
      return Object.assign({}, state, { authFailure: action.message });
    case 'SET_TRANSLATIONS':
      return Object.assign({}, state, { translations: action.translations });
    case 'CHECK_SSO':
      return Object.assign({}, state, { ssoEnabled: action.ssoEnabled });
    case 'OKAPI_READY':
      return Object.assign({}, state, { okapiReady: true });
    default:
      return state;
  }
}
