import localforage from 'localforage';

import {
  createOkapiSession,
  handleLoginError,
  loadTranslations,
  processOkapiSession,
  setCurServicePoint,
  setServicePoints,
  supportedLocales,
  supportedNumberingSystems,
  updateUser,
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

import { defaultErrors } from './constants';



jest.mock('localforage', () => ({
  getItem: jest.fn(() => Promise.resolve({ user: {} })),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

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
        permissions: [{ permissionName: 'a' }, { permissionName: 'b' }]
      }
    };
    const permissionsMap = { a: true, b: true };

    mockFetchSuccess([]);

    await createOkapiSession('url', store, 'tenant', 'token', data);
    expect(store.dispatch).toHaveBeenCalledWith(setAuthError(null));
    expect(store.dispatch).toHaveBeenCalledWith(setLoginData(data));
    expect(store.dispatch).toHaveBeenCalledWith(setCurrentPerms(permissionsMap));

    mockFetchCleanUp();
  });
});

describe('handleLoginError', () => {
  it('dispatches setOkapiReady', async () => {
    const dispatch = jest.fn();
    await handleLoginError(dispatch, {});
    expect(dispatch).toHaveBeenCalledWith(setOkapiReady());
    expect(dispatch).toHaveBeenCalledWith(setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]));
  });
});

describe('loadTranslations', () => {
  it('dispatches setLocale', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const locale = 'cs-CZ';

    mockFetchSuccess({});
    await loadTranslations(store, locale, {});
    expect(store.dispatch).toHaveBeenCalledWith(setLocale(locale));
    mockFetchCleanUp();
  });

  describe('sets document attributes correctly', () => {
    it('sets lang given region', async () => {
      const store = {
        dispatch: jest.fn(),
      };
      const locale = 'cs-CZ';

      mockFetchSuccess({});
      await loadTranslations(store, locale, {});
      expect(document.documentElement.lang).toMatch('cs');
      mockFetchCleanUp();
    });

    it('sets lang without region', async () => {
      const store = {
        dispatch: jest.fn(),
      };
      const locale = 'cs';

      mockFetchSuccess({});
      await loadTranslations(store, locale, {});
      expect(document.documentElement.lang).toMatch('cs');
      mockFetchCleanUp();
    });

    it('sets dir (LTR)', async () => {
      const store = {
        dispatch: jest.fn(),
      };
      const locale = 'fr';

      mockFetchSuccess({});
      await loadTranslations(store, locale, {});
      expect(document.dir).toMatch('ltr');
      mockFetchCleanUp();
    });

    it('sets dir (RTL)', async () => {
      const store = {
        dispatch: jest.fn(),
      };
      const locale = 'ar';

      mockFetchSuccess({});
      await loadTranslations(store, locale, {});
      expect(document.dir).toMatch('rtl');
      mockFetchCleanUp();
    });
  });
});

describe('processOkapiSession', () => {
  it('handles success', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const resp = {
      headers: {
        get: jest.fn(),
      },
      ok: true,
      json: () => Promise.resolve({
        user: { id: 'id' },
        permissions: {
          permissions: [{ permissionName: 'a' }, { permissionName: 'b' }]
        }
      }),
    };

    mockFetchSuccess();

    await processOkapiSession('url', store, 'tenant', resp, 'token');
    expect(store.dispatch).toHaveBeenCalledWith(setAuthError(null));
    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady());

    mockFetchCleanUp();
  });

  it('handles error', async () => {
    const store = {
      dispatch: jest.fn()
    };
    const resp = {
      headers: {
        get: jest.fn(),
      }
    };

    await processOkapiSession('url', store, 'tenant', resp, 'token');

    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady());
    expect(store.dispatch).toHaveBeenCalledWith(setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]));
  });
});

describe('setCurServicePoint', () => {
  it('dispatches setCurrentServicePoint', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const sp = 'monkey-bagel';
    await setCurServicePoint(store, sp);
    expect(store.dispatch).toHaveBeenCalledWith(setCurrentServicePoint(sp));
  });
});

describe('setServicePoints', () => {
  it('dispatches setUserServicePoints', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const data = ['thunder', 'chicken'];
    await setServicePoints(store, data);
    expect(store.dispatch).toHaveBeenCalledWith(setUserServicePoints(data));
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

describe('updateUser', () => {
  it('dispatches updateCurrentUser', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const data = { thunder: 'chicken' };
    await updateUser(store, data);
    expect(store.dispatch).toHaveBeenCalledWith(updateCurrentUser(data));
  });
});