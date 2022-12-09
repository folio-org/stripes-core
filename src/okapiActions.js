export function setCurrentServicePoint(servicePoint) {
  return {
    type: 'SET_CURRENT_SERVICE_POINT',
    servicePoint,
  };
}

export function setUserServicePoints(servicePoints) {
  return {
    type: 'SET_USER_SERVICE_POINTS',
    servicePoints,
  };
}

export function updateCurrentUser(data) {
  return {
    type: 'UPDATE_CURRENT_USER',
    data,
  };
}
