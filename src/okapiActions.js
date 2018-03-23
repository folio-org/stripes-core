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

export { setCurrentUser,
  clearCurrentUser,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setPlugins,
  setSinglePlugin,
  setBindings,
  setOkapiToken,
  clearOkapiToken,
  setAuthError,
  setTranslations,
  checkSSO,
  setOkapiReady,
  setServerDown };
