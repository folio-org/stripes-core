

export default function okapiReducer(state = {}, action) {
  switch (action.type) {
    case 'SET_OKAPI_TOKEN':
      return Object.assign({}, state, { token: action.token });
    case 'CLEAR_OKAPI_TOKEN':
      return Object.assign({}, state, { token: null });
    case 'SET_CURRENT_USER':
      return Object.assign({}, state, { currentUser: action.currentUser });
    case 'SET_CURRENT_PERMS':
      return Object.assign({}, state, { currentPerms: action.currentPerms });
    case 'CLEAR_CURRENT_USER':
      return Object.assign({}, state, { currentUser: {}, currentPerms: {} });
    case 'AUTH_FAILURE':
      return Object.assign({}, state, { authFailure: true });
    case 'CLEAR_AUTH_FAILURE':
      return Object.assign({}, state, { authFailure: false });
    default:
      return state;
  }
}
