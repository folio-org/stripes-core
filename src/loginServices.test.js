import {
  createOkapiSession,
  supportedLocales,
  supportedNumberingSystems,
  validateUser,
} from './loginServices';

import {
  clearCurrentUser,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setCurrency,
  setPlugins,
  setBindings,
  setTranslations,
  clearOkapiToken,
  setAuthError,
  checkSSO,
  setOkapiReady,
  setServerDown,
  setSessionData,
  setLoginData,
  setCurrentServicePoint,
  setUserServicePoints,
  updateCurrentUser,
} from './okapiActions';

// fetch success: resolve promise with ok == true and $data in json()
const mockFetchSuccess = (data) => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
    })
  ));
};

// fetch failure: reject promise with $error
const mockFetchError = (error) => {
  global.fetch = jest.fn().mockImplementation(() => Promise.reject(error));
};

// restore default fetch impl
const mockFetchCleanUp = () => {
  global.fetch.mockClear();
  delete global.fetch;
};


describe('createOkapiSession', () => {
  it('clears authentication errors', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const data = {
      user: {
        id: 'user-id',
      },
      permissions: {
        permissions: [{ permissonName: 'a' }, { permissionName: 'b' }]
      }
    };

    mockFetchSuccess([]);

    await createOkapiSession('url', store, 'tenant', 'token', data);
    expect(store.dispatch).toHaveBeenCalledWith({
      type: 'SET_AUTH_FAILURE',
      message: null
    });
    mockFetchCleanUp();
  });
});

describe('supportedLocales', () => {
  it('is an array of strings', () => {
    expect(Array.isArray(supportedLocales)).toBe(true);
    expect(typeof supportedLocales[0]).toBe('string');
  });
});

describe('supportedNumberingSystems', () => {
  it('is an array of strings', () => {
    expect(Array.isArray(supportedNumberingSystems)).toBe(true);
    expect(typeof supportedNumberingSystems[0]).toBe('string');
  });
});

describe('validateUser', () => {
  it('handles fetch failure from "_self"', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    mockFetchError();

    await validateUser('url', store, 'tenant', {});
    expect(store.dispatch).toHaveBeenCalledWith(setServerDown());
    mockFetchCleanUp();
  });

  it('handles valid user', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    const data = { monkey: 'bagel' };
    const token = 'token';
    const user = { id: 'id' };
    const perms = [];
    const session = {
      token,
      user,
      perms,
    };

    mockFetchSuccess(data);

    await validateUser('url', store, 'tenant', session);
    expect(store.dispatch).toHaveBeenCalledWith(setLoginData(data));
    expect(store.dispatch).toHaveBeenCalledWith(setSessionData({ token, user, perms }));

    mockFetchCleanUp();
  });

  it('handles invalid user', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ ok: false });
    });

    await validateUser('url', store, 'tenant', {});
    expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
    expect(store.dispatch).toHaveBeenCalledWith(clearOkapiToken());
    mockFetchCleanUp();
  });
});
