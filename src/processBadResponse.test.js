import processBadResponse from './processBadResponse';

// const getLoginErrors = (payload) => {
//   try {
//     if (isObject(payload)) {
//       const { errors } = payload;

//       return errors;
//     } else {
//       const { errors } = JSON.parse(payload);

//       return errors || [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
//     }
//   } catch (e) {
//     return [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
//   }
// };

// function getProcessedErrors(response, status, defaultClientError) {
//   switch (status) {
//     case 400:
//       return [defaultClientError];
//     case 422:
//       return getLoginErrors(response);
//     case 404:  // Okapi's deployment of mod-users-bl hasn't completed
//     case 500:
//       return [defaultErrors.DEFAULT_LOGIN_SERVER_ERROR];
//     default:
//       return [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
//   }
// }

// import { setAuthError } from './okapiActions';

// jest.mock('./okapiActions', () => ({
//   setAuthError: (...rest) => rest,
// }));

import { defaultErrorCodes, defaultErrors } from './constants';
import { setAuthError } from './okapiActions';

describe('processBadResponse', () => {
  it('shows default error if response processing throws', async () => {
    const dispatch = jest.fn();
    const response = {
      status: 404,
      json: '', // response.json is not a function
    };

    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]);

    await processBadResponse(dispatch, response);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows default error without defaultClientError', async () => {
    const dispatch = jest.fn();
    const response = {
      json: () => Promise.resolve({
        errorMessage: 'monkey',
      })
    };
    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]);

    await processBadResponse(dispatch, response);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login server error given 404', async () => {
    const dispatch = jest.fn();
    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_SERVER_ERROR]);
    const response = {
      status: 404,
      json: () => Promise.resolve({}),
    };

    await processBadResponse(dispatch, response);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login server error given 500', async () => {
    const dispatch = jest.fn();
    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_SERVER_ERROR]);
    const response = {
      status: 500,
      json: () => Promise.resolve({}),
    };

    await processBadResponse(dispatch, response);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows given error given 400', async () => {
    const dispatch = jest.fn();
    const message = setAuthError(['monkey']);
    const response = {
      status: 400,
      json: () => Promise.resolve({}),
    };

    await processBadResponse(dispatch, response, 'monkey');
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login error given 422 and errors', async () => {
    const dispatch = jest.fn();
    const error = 'thunder-chicken';
    const message = setAuthError([error]);
    const response = {
      status: 422,
      json: () => Promise.resolve({ errors: [error] }),
    };

    await processBadResponse(dispatch, response, message);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login error given 422 and error string', async () => {
    const dispatch = jest.fn();
    const error = 'funky-chicken';
    const message = setAuthError([error]);
    const response = {
      status: 422,
      json: () => Promise.resolve(JSON.stringify({ errors: [error] })),
    };

    await processBadResponse(dispatch, response, message);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login error given 422 and string', async () => {
    const dispatch = jest.fn();
    const response = {
      status: 422,
      json: () => Promise.resolve(JSON.stringify({ no: 'error' })),
    };

    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]);
    await processBadResponse(dispatch, response, message);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

  it('shows login error given 422 and string', async () => {
    const dispatch = jest.fn();
    const response = {
      status: 422,
      json: () => Promise.resolve('nope, not JSON'),
    };

    const message = setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]);
    await processBadResponse(dispatch, response, message);
    expect(dispatch).toHaveBeenCalledWith(message);
  });

});

// export default async function processBadResponse(dispatch, response, defaultClientError) {
//   const clientError = defaultClientError || defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR;
//   let actionPayload;

//   try {
//     const responseBody = await response.json();
//     const responsePayload = responseBody.errorMessage || responseBody;
//     actionPayload = getProcessedErrors(responsePayload, response.status, clientError);
//   } catch (e) {
//     actionPayload = [defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR];
//   }
//   dispatch(setAuthError(actionPayload));
// }
