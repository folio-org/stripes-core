

export default function okapiReducer(state = {}, action) {
  switch (action.type) {
    case 'SET_OKAPI_TOKEN':
      return Object.assign({}, state, { token: action.token });
    case 'CLEAR_OKAPI_TOKEN':
      return Object.assign({}, state, { token: null });
    case 'SET_CURRENT_USER':
      return Object.assign({}, state, { currentUser: { username: action.username }});
    case 'CLEAR_CURRENT_USER':
      return Object.assign({}, state, { currentUser: { }});
    default:
      return state;
  }
}
