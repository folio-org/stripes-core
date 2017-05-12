

function setCurrentUser(currentUser) {
  return {
    type: 'SET_CURRENT_USER',
    currentUser,
  };
}

function setCurrentPerms(currentPerms) {
  return {
    type: 'SET_CURRENT_PERMS',
    currentPerms,
  };
}

function clearCurrentUser() {
  return {
    type: 'CLEAR_CURRENT_USER',
  };
}

function setLocale(locale) {
  return {
    type: 'SET_LOCALE',
    locale,
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

function resetStore() {
  return {
    type: 'RESET_STORE',
  };
}

export { setCurrentUser,
         setCurrentPerms,
         setLocale,
         clearCurrentUser,
         setOkapiToken,
         clearOkapiToken,
         authFailure,
         clearAuthFailure,
         resetStore };
