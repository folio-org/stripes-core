import processBadResponse from './processBadResponse';

import { defaultErrors } from './constants';
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

