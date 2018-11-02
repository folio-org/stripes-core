import { setAuthError } from './okapiActions';

function getDefaultError() {
  return {
    code :'default.error',
    type :'error',
  };
}

function getProcessedErrors(errorMessage, response) {
  const processedErrors = [];
  const { status } = response;

  if (status === 422) {
    try {
      const {
        errors,
      } = JSON.parse(errorMessage);

      processedErrors.push(...errors);
    } catch (e) {
      processedErrors.push(getDefaultError());
    }
  } else {
    processedErrors.push(getDefaultError());
  }

  return processedErrors;
}

export default function processBadResponse(store, response) {
  response.json().then(({ errorMessage }) => {
    store.dispatch(setAuthError(getProcessedErrors(errorMessage, response)));
  });
}
