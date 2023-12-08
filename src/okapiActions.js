function setCurrentUser(currentUser) {
  return {
    type: 'SET_CURRENT_USER',
    currentUser,
  };
}

function clearCurrentUser() {
  return {
    type: 'CLEAR_CURRENT_USER',
  };
}

function setCurrentPerms(currentPerms) {
  return {
    type: 'SET_CURRENT_PERMS',
    currentPerms,
  };
}

function setLocale(locale) {
  return {
    type: 'SET_LOCALE',
    locale,
  };
}

function setTimezone(timezone) {
  return {
    type: 'SET_TIMEZONE',
    timezone,
  };
}

function setCurrency(currency) {
  return {
    type: 'SET_CURRENCY',
    currency,
  };
}

function setPlugins(plugins) {
  return {
    type: 'SET_PLUGINS',
    plugins,
  };
}

function setSinglePlugin(name, value) {
  return {
    type: 'SET_SINGLE_PLUGIN',
    name,
    value,
  };
}

function setBindings(bindings) {
  return {
    type: 'SET_BINDINGS',
    bindings,
  };
}

function setOkapiToken(token) {
  return {
    type: 'SET_OKAPI_TOKEN',
    token,
  };
}

function clearOkapiToken() {
  return {
    type: 'CLEAR_OKAPI_TOKEN',
  };
}

function setIsAuthenticated(b) {
  return {
    type: 'SET_IS_AUTHENTICATED',
    isAuthenticated: Boolean(b),
  };
}

function setAuthError(message) {
  return {
    type: 'SET_AUTH_FAILURE',
    message,
  };
}

function setTranslations(translations) {
  return {
    type: 'SET_TRANSLATIONS',
    translations,
  };
}

function checkSSO(ssoEnabled) {
  return {
    type: 'CHECK_SSO',
    ssoEnabled,
  };
}

function setOkapiReady() {
  return {
    type: 'OKAPI_READY',
  };
}

function setServerDown() {
  return {
    type: 'SERVER_DOWN',
  };
}

function setSessionData(session) {
  return {
    type: 'SET_SESSION_DATA',
    session,
  };
}

function setLoginData(loginData) {
  return {
    type: 'SET_LOGIN_DATA',
    loginData,
  };
}

function updateCurrentUser(data) {
  return {
    type: 'UPDATE_CURRENT_USER',
    data,
  };
}

function setOkapiTenant(payload) {
  return {
    type: 'SET_OKAPI_TENANT',
    payload
  };
}

function setTokenExpiration(tokenExpiration) {
  return {
    type: 'SET_TOKEN_EXPIRATION',
    tokenExpiration,
  };
}

function setRtrTimeout(rtrTimeout) {
  return {
    type: 'SET_RTR_TIMEOUT',
    rtrTimeout,
  };
}

function clearRtrTimeout() {
  return {
    type: 'CLEAR_RTR_TIMEOUT',
  };
}

function toggleRtrModal(isVisible) {
  return {
    type: 'TOGGLE_RTR_MODAL',
    isVisible,
  };
}

export {
  checkSSO,
  clearCurrentUser,
  clearOkapiToken,
  clearRtrTimeout,
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
  setRtrTimeout,
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
