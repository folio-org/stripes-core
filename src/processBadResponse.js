import { defaultErrors } from './constants';
import { setAuthError } from './okapiActions';

const getDefaultError = () => (
  {
    code: defaultErrors.DEFAULT_ERROR,
    type: 'error',
  }
);

const getDefaultServerError = () => (
  {
    code: defaultErrors.DEFAULT_SERVER_ERROR,
    type: 'error'
  }
);

const getProcessedServerErrors = (response) => {
  const processedErrors = [];
  const { status } = response;

  // Todo: remove status = 400 when backend is ready
  if (status >= 500 || status === 400) {
    processedErrors.push(getDefaultServerError());
  }

  return processedErrors;
};

const getProcessedErrors = (errorMessage, response) => {
  const processedErrors = [];
  const { status } = response;

  if (status === 422) {
    try {
      if (typeof errorMessage === 'object') {
        const { errors } = errorMessage;
        processedErrors.push(...errors);
      } else {
        const { errors } = JSON.parse(errorMessage);
        processedErrors.push(...errors);
      }
    } catch (e) {
      processedErrors.push(getDefaultError());
    }
  } else {
    processedErrors.push(getDefaultError());
  }

  return processedErrors;
};


export default function processBadResponse(store, response) {
  response.json()
    .then(responseBody => {
      const { errorMessage } = responseBody;
      const responsePayload = errorMessage || responseBody;

      store.dispatch(setAuthError(getProcessedErrors(responsePayload, response)));
    })
    .catch(() => store.dispatch(setAuthError(getProcessedServerErrors(response))));
}
