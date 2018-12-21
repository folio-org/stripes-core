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

function getProcessedErrors(response, status, defaultClientError) {
  switch (status) {
    case 400:
      return [defaultClientError];
    case 422:
      return getLoginErrors(response);
    case 500:
      return [defaultErrors.DEFAULT_LOGIN_SERVER_ERROR];
    default:
      return [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
  }
}

export default async function processBadResponse(dispatch, response, defaultClientError) {
  const clientError = defaultClientError || defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR;
  let actionPayload;

  try {
    const responseBody = await response.json();
    const responsePayload = responseBody.errorMessage || responseBody;
    actionPayload = getProcessedErrors(responsePayload, response.status, clientError);
  } catch (e) {
    actionPayload = [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
  }
  dispatch(setAuthError(actionPayload));
}
