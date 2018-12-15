import { isObject } from 'lodash';

import { defaultErrors } from './constants';
import { setAuthError } from './okapiActions';

const getLoginErrors = (payload) => {
  try {
    if (isObject(payload)) {
      const { errors } = payload;

      return errors;
    } else {
      const { errors } = JSON.parse(payload);

      return errors || [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
    }
  } catch (e) {
    return [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
  }
};

function getProcessedErrors(response, status) {
  switch (status) {
    case 422:
      return getLoginErrors(response);
    case 500:
      return [defaultErrors.DEFAULT_LOGIN_SERVER_ERROR];
    default:
      return [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
  }
}

export default async function processBadResponse(dispatch, response) {
  let actionPayload;

  try {
    const responseBody = await response.json();
    const responsePayload = responseBody.errorMessage || responseBody;
    actionPayload = getProcessedErrors(responsePayload, response.status);
  } catch (e) {
    actionPayload = [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
  }
  dispatch(setAuthError(actionPayload));
}
