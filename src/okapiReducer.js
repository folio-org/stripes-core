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
    case 'SET_TIMEZONE':
      return Object.assign({}, state, { timezone: action.timezone });
    case 'SET_CURRENCY':
      return Object.assign({}, state, { currency: action.currency });
    case 'SET_PLUGINS':
      return Object.assign({}, state, { plugins: action.plugins });
    case 'SET_SINGLE_PLUGIN':
      return Object.assign({}, state, { plugins: Object.assign({}, state.plugins, { [action.name]: action.value }) });
    case 'SET_BINDINGS':
      return Object.assign({}, state, { bindings: action.bindings });
    case 'SET_CURRENT_PERMS':
      return Object.assign({}, state, { currentPerms: action.currentPerms });
    case 'SET_LOGIN_DATA':
      return Object.assign({}, state, { loginData: action.loginData });
    case 'CLEAR_CURRENT_USER':
      return Object.assign({}, state, { currentUser: {}, currentPerms: {} });
    case 'SET_SESSION_DATA': {
      const { perms, user, token } = action.session;
      return { ...state, currentUser: user, currentPerms: perms, token };
    }
    case 'SET_AUTH_FAILURE':
      return Object.assign({}, state, { authFailure: action.message });
    case 'SET_TRANSLATIONS':
      return Object.assign({}, state, { translations: action.translations });
    case 'CHECK_SSO':
      return Object.assign({}, state, { ssoEnabled: action.ssoEnabled });
    case 'OKAPI_READY':
      return Object.assign({}, state, { okapiReady: true });
    case 'SERVER_DOWN':
      return Object.assign({}, state, { serverDown: true });
    case 'UPDATE_CURRENT_USER':
      return { ...state, currentUser: { ...state.currentUser, ...action.data } };
    default:
      return state;
  }
}
