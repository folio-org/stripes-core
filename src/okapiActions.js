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

function authFailure() {
  return {
    type: 'AUTH_FAILURE',
  };
}

function clearAuthFailure() {
  return {
    type: 'CLEAR_AUTH_FAILURE',
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

export { setCurrentUser,
         clearCurrentUser,
         setCurrentPerms,
         setLocale,
         setPlugins,
         setSinglePlugin,
         setBindings,
         setOkapiToken,
         clearOkapiToken,
         authFailure,
         clearAuthFailure,
         setTranslations,
         checkSSO };
