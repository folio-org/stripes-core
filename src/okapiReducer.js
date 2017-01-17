

export default function okapiReducer(state = {}, action) {
  switch (action.type) {
    case 'SET_OKAPI_TOKEN':
      return Object.assign({}, state, {
        token: action.token,
      });
    case 'CLEAR_OKAPI_TOKEN':
      return Object.assign({}, state, { token: null });
    default:
      return state;
  }
}
