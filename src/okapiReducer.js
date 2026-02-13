export const OKAPI_REDUCER_ACTIONS = {
  ADD_ICON: 'ADD_ICON',
  CHECK_SSO: 'CHECK_SSO',
  CLEAR_CURRENT_USER: 'CLEAR_CURRENT_USER',
  CLEAR_OKAPI_TOKEN: 'CLEAR_OKAPI_TOKEN',
  OKAPI_READY: 'OKAPI_READY',
  SERVER_DOWN: 'SERVER_DOWN',
  SET_AUTH_FAILURE: 'SET_AUTH_FAILURE',
  SET_BINDINGS: 'SET_BINDINGS',
  SET_CURRENCY: 'SET_CURRENCY',
  SET_CURRENT_PERMS: 'SET_CURRENT_PERMS',
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_IS_AUTHENTICATED: 'SET_IS_AUTHENTICATED',
  SET_LOCALE: 'SET_LOCALE',
  SET_LOGIN_DATA: 'SET_LOGIN_DATA',
  SET_OKAPI_TENANT: 'SET_OKAPI_TENANT',
  SET_OKAPI_TOKEN: 'SET_OKAPI_TOKEN',
  SET_PLUGINS: 'SET_PLUGINS',
  SET_SESSION_DATA: 'SET_SESSION_DATA',
  SET_SINGLE_PLUGIN: 'SET_SINGLE_PLUGIN',
  SET_TIMEZONE: 'SET_TIMEZONE',
  SET_TOKEN_EXPIRATION: 'SET_TOKEN_EXPIRATION',
  SET_TRANSLATIONS: 'SET_TRANSLATIONS',
  TOGGLE_RTR_MODAL: 'TOGGLE_RTR_MODAL',
  UPDATE_CURRENT_USER: 'UPDATE_CURRENT_USER',
};

export default function okapiReducer(state = {}, action) {
  switch (action.type) {
    case OKAPI_REDUCER_ACTIONS.SET_OKAPI_TENANT: {
      const { tenant, clientId } = action.payload;
      return Object.assign({}, state, { tenant, clientId });
    }
    case OKAPI_REDUCER_ACTIONS.SET_OKAPI_TOKEN:
      return Object.assign({}, state, { token: action.token });
    case OKAPI_REDUCER_ACTIONS.CLEAR_OKAPI_TOKEN:
      return Object.assign({}, state, { token: null });
    case OKAPI_REDUCER_ACTIONS.SET_CURRENT_USER:
      return Object.assign({}, state, { currentUser: action.currentUser });
    case OKAPI_REDUCER_ACTIONS.SET_IS_AUTHENTICATED: {
      const newState = {
        isAuthenticated: action.isAuthenticated,
      };
      // hide the IST modal on logout
      if (!action.isAuthenticated) {
        newState.rtrModalIsVisible = false;
      }

      return { ...state, ...newState };
    }
    case OKAPI_REDUCER_ACTIONS.SET_LOCALE:
      return Object.assign({}, state, { locale: action.locale });
    case OKAPI_REDUCER_ACTIONS.SET_TIMEZONE:
      return Object.assign({}, state, { timezone: action.timezone });
    case OKAPI_REDUCER_ACTIONS.SET_CURRENCY:
      return Object.assign({}, state, { currency: action.currency });
    case OKAPI_REDUCER_ACTIONS.SET_PLUGINS:
      return Object.assign({}, state, { plugins: action.plugins });
    case OKAPI_REDUCER_ACTIONS.SET_SINGLE_PLUGIN:
      return Object.assign({}, state, { plugins: Object.assign({}, state.plugins, { [action.name]: action.value }) });
    case OKAPI_REDUCER_ACTIONS.SET_BINDINGS:
      return Object.assign({}, state, { bindings: action.bindings });
    case OKAPI_REDUCER_ACTIONS.SET_CURRENT_PERMS:
      return Object.assign({}, state, { currentPerms: action.currentPerms });
    case OKAPI_REDUCER_ACTIONS.SET_LOGIN_DATA:
      return Object.assign({}, state, { loginData: action.loginData });
    case OKAPI_REDUCER_ACTIONS.SET_TOKEN_EXPIRATION:
      return Object.assign({}, state, { loginData: { ...state.loginData, tokenExpiration: action.tokenExpiration } });
    case OKAPI_REDUCER_ACTIONS.CLEAR_CURRENT_USER:
      return Object.assign({}, state, { currentUser: {}, currentPerms: {} });
    case OKAPI_REDUCER_ACTIONS.SET_SESSION_DATA: {
      const { isAuthenticated, perms, tenant, token, user } = action.session;
      const sessionTenant = tenant || state.tenant;

      return { ...state, currentUser: user, currentPerms: perms, isAuthenticated, tenant: sessionTenant, token };
    }
    case OKAPI_REDUCER_ACTIONS.SET_AUTH_FAILURE:
      return Object.assign({}, state, { authFailure: action.message });
    case OKAPI_REDUCER_ACTIONS.SET_TRANSLATIONS:
      return { ...state, translations: { ...state.translations, ...action.translations } };
    case OKAPI_REDUCER_ACTIONS.CHECK_SSO:
      return Object.assign({}, state, { ssoEnabled: action.ssoEnabled });
    case OKAPI_REDUCER_ACTIONS.OKAPI_READY:
      return Object.assign({}, state, { okapiReady: true });
    case OKAPI_REDUCER_ACTIONS.SERVER_DOWN:
      return Object.assign({}, state, { serverDown: true });
    case OKAPI_REDUCER_ACTIONS.UPDATE_CURRENT_USER:
      return { ...state, currentUser: { ...state.currentUser, ...action.data } };

    case OKAPI_REDUCER_ACTIONS.TOGGLE_RTR_MODAL: {
      return { ...state, rtrModalIsVisible: action.isVisible };
    }

    /**
     * state.icons looks like
     * {
     *   "@folio/some-app": {
     *     app: { alt, src},
     *     otherIcon: { alt, src }
     *   },
     *   "@folio/other-app": { app: ...}
     * }
     *
     * action.key looks like @folio/some-app or @folio/other-app
     * action.icon looks like { alt: ... } or { otherIcon: ... }
     */
    case OKAPI_REDUCER_ACTIONS.ADD_ICON: {
      let val = action.icon;

      // if there are already icons defined for this key,
      // add this payload to them
      if (state.icons?.[action.key]) {
        val = {
          ...state.icons[action.key],
          ...action.icon,
        };
      }

      return { ...state, icons: { ...state.icons, [action.key]: val } };
    }

    default:
      return state;
  }
}
