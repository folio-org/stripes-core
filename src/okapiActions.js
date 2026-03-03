import { OKAPI_REDUCER_ACTIONS } from './okapiReducer';

function setCurrentUser(currentUser) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_CURRENT_USER,
    currentUser,
  };
}

function clearCurrentUser() {
  return {
    type: OKAPI_REDUCER_ACTIONS.CLEAR_CURRENT_USER,
  };
}

function setCurrentPerms(currentPerms) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_CURRENT_PERMS,
    currentPerms,
  };
}

function setLocale(locale) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_LOCALE,
    locale,
  };
}

function setTimezone(timezone) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_TIMEZONE,
    timezone,
  };
}

function setCurrency(currency) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_CURRENCY,
    currency,
  };
}

function setPlugins(plugins) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_PLUGINS,
    plugins,
  };
}

function setSinglePlugin(name, value) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_SINGLE_PLUGIN,
    name,
    value,
  };
}

function setBindings(bindings) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_BINDINGS,
    bindings,
  };
}

function setOkapiToken(token) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_OKAPI_TOKEN,
    token,
  };
}

function clearOkapiToken() {
  return {
    type: OKAPI_REDUCER_ACTIONS.CLEAR_OKAPI_TOKEN,
  };
}

function setIsAuthenticated(b) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_IS_AUTHENTICATED,
    isAuthenticated: Boolean(b),
  };
}

function setAuthError(message) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_AUTH_FAILURE,
    message,
  };
}

function setTranslations(translations) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_TRANSLATIONS,
    translations,
  };
}

function checkSSO(ssoEnabled) {
  return {
    type: OKAPI_REDUCER_ACTIONS.CHECK_SSO,
    ssoEnabled,
  };
}

function setOkapiReady() {
  return {
    type: OKAPI_REDUCER_ACTIONS.OKAPI_READY,
  };
}

function setServerDown() {
  return {
    type: OKAPI_REDUCER_ACTIONS.SERVER_DOWN,
  };
}

function setSessionData(session) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_SESSION_DATA,
    session,
  };
}

function setLoginData(loginData) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_LOGIN_DATA,
    loginData,
  };
}

function updateCurrentUser(data) {
  return {
    type: OKAPI_REDUCER_ACTIONS.UPDATE_CURRENT_USER,
    data,
  };
}

function setOkapiTenant(payload) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_OKAPI_TENANT,
    payload
  };
}

function setTokenExpiration(tokenExpiration) {
  return {
    type: OKAPI_REDUCER_ACTIONS.SET_TOKEN_EXPIRATION,
    tokenExpiration,
  };
}

function toggleRtrModal(isVisible) {
  return {
    type: OKAPI_REDUCER_ACTIONS.TOGGLE_RTR_MODAL,
    isVisible,
  };
}

function addIcon(key, icon) {
  return {
    type: OKAPI_REDUCER_ACTIONS.ADD_ICON,
    key,
    icon
  };
}

export {
  addIcon,
  checkSSO,
  clearCurrentUser,
  clearOkapiToken,
  setAuthError,
  setBindings,
  setCurrency,
  setCurrentPerms,
  setCurrentUser,
  setIsAuthenticated,
  setLocale,
  setLoginData,
  setOkapiReady,
  setOkapiToken,
  setPlugins,
  setServerDown,
  setSessionData,
  setSinglePlugin,
  setTimezone,
  setTokenExpiration,
  setTranslations,
  toggleRtrModal,
  updateCurrentUser,
  setOkapiTenant
};
