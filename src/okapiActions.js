

function setCurrentUser(username) {
  return {
    type: 'SET_CURRENT_USER',
    username,
  };
}

function clearCurrentUser() {
  return {
    type: 'CLEAR_CURRENT_USER',
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
         setOkapiToken,
         clearOkapiToken,
         authFailure,
         clearAuthFailure };
