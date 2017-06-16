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

export { setCurrentUser,
         clearCurrentUser,
         setCurrentPerms,
         setLocale,
         setPlugins,
         setBindings,
         setOkapiToken,
         clearOkapiToken,
         authFailure,
         clearAuthFailure };
