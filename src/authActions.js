function setToken(token) {
  return {
    type: SET_TOKEN,
    token,
  }
}

function clearToken() {
  return {
    type: CLEAR_TOKEN,
  }
}