import localforage from 'localforage';

import {
  createOkapiSession,
  getOkapiSession,
  getTokenExpiry,
  handleLoginError,
  loadTranslations,
  logout,
  processOkapiSession,
  setTokenExpiry,
  spreadUserWithPerms,
  supportedLocales,
  supportedNumberingSystems,
  updateTenant,
  updateUser,
  validateUser,
  IS_LOGGING_OUT,
  SESSION_NAME
} from './loginServices';

import {
  clearCurrentUser,
  clearOkapiToken,
  setCurrentPerms,
  setLocale,
  // setTimezone,
  // setCurrency,
  // setPlugins,
  // setBindings,
  // setTranslations,
  setAuthError,
  // checkSSO,
  setIsAuthenticated,
  setOkapiReady,
  setServerDown,
  setSessionData,
  // setTokenExpiration,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';

import { defaultErrors } from './constants';

jest.mock('localforage', () => ({
  getItem: jest.fn(() => Promise.resolve({ user: {} })),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('stripes-config', () => ({
  config: {
    tenantOptions: {
      romulus: { name: 'romulus', clientId: 'romulus-application' },
      remus: { name: 'remus', clientId: 'remus-application' },
    }
  },
  okapi: {
    authnUrl: 'https://authn.url',
  },
  translations: {}
}));

// fetch success: resolve promise with ok == true and $data in json()
const mockFetchSuccess = (data) => {
  global.fetch = jest.fn().mockImplementation(() => (
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data),
      headers: new Map(),
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

    const te = {
      accessTokenExpiration: '2023-11-06T18:05:33Z',
      refreshTokenExpiration: '2023-10-30T18:15:33Z',
    };

    const data = {
      user: {
        id: 'user-id',
      },
      permissions: {
        permissions: [{ permissionName: 'a' }, { permissionName: 'b' }]
      },
      tokenExpiration: te,
    };
    const permissionsMap = { a: true, b: true };
    mockFetchSuccess([]);

    await createOkapiSession(store, 'tenant', 'token', data);
    expect(store.dispatch).toHaveBeenCalledWith(setIsAuthenticated(true));
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

    await processOkapiSession(store, 'tenant', resp);
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

    await processOkapiSession(store, 'tenant', resp);

    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady());
    expect(store.dispatch).toHaveBeenCalledWith(setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]));
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

  it('handles valid user with empty tenant in session', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    const tenant = 'tenant';
    const data = { monkey: 'bagel' };
    const user = { id: 'id' };
    const perms = [];
    const session = {
      user,
      perms,
    };

    mockFetchSuccess(data);

    // set a fixed system time so date math is stable
    const now = new Date('2023-10-30T19:34:56.000Z');
    jest.useFakeTimers().setSystemTime(now);

    await validateUser('url', store, tenant, session);

    expect(store.dispatch).toHaveBeenNthCalledWith(1, setAuthError(null));
    expect(store.dispatch).toHaveBeenNthCalledWith(2, setLoginData(data));

    mockFetchCleanUp();
  });

  it('handles valid user with tenant in session', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    const tenant = 'tenant';
    const sessionTenant = 'sessionTenant';
    const data = { monkey: 'bagel' };
    const user = { id: 'id' };
    const perms = [];
    const session = {
      user,
      perms,
      tenant: sessionTenant,
    };

    mockFetchSuccess(data);

    await validateUser('url', store, tenant, session);
    expect(store.dispatch).toHaveBeenNthCalledWith(1, setAuthError(null));
    expect(store.dispatch).toHaveBeenNthCalledWith(2, setLoginData(data));

    mockFetchCleanUp();
  });

  it('overwrites session data with new values from _self', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    const tenant = 'tenant';
    const sessionTenant = 'sessionTenant';
    const data = {
      user: {
        id: 'ego',
        username: 'superego',
      },
      permissions: {
        permissions: [{ permissionName: 'ask' }, { permissionName: 'tell' }],
      }
    };

    const session = {
      user: { id: 'id', username: 'username' },
      perms: { foo: true },
      tenant: sessionTenant,
      token: 'token',
    };

    mockFetchSuccess(data);

    await validateUser('url', store, tenant, session);

    const updatedSession = {
      user: data.user,
      isAuthenticated: true,
      perms: { ask: true, tell: true },
      tenant: session.tenant,
      token: session.token,
    };

    expect(store.dispatch).toHaveBeenNthCalledWith(1, setAuthError(null));
    expect(store.dispatch).toHaveBeenNthCalledWith(2, setLoginData(data));
    expect(store.dispatch).toHaveBeenNthCalledWith(3, setCurrentPerms({ ask: true, tell: true }));
    expect(store.dispatch).toHaveBeenNthCalledWith(4, setSessionData(updatedSession));

    mockFetchCleanUp();
  });

  it('handles invalid user', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: { tenant: 'monkey' } }),
    };

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ ok: false });
    });

    await validateUser('url', store, 'tenant', {});
    expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
    expect(store.dispatch).toHaveBeenCalledWith(setServerDown());
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

describe('updateTenant', () => {
  const okapi = {
    currentPerms: {},
  };
  const tenant = 'test';
  const data = {
    user: {
      id: 'userId',
      username: 'testuser',
    },
    permissions: {
      permissions: [{ permissionName: 'test.permissions' }],
    },
  };

  beforeEach(() => {
    localforage.setItem.mockClear();
  });

  it('should set tenant and updated user in session', async () => {
    mockFetchSuccess(data);
    await updateTenant(okapi, tenant);
    mockFetchCleanUp();

    expect(localforage.setItem).toHaveBeenCalledWith('okapiSess', {
      ...spreadUserWithPerms(data),
      tenant,
    });
  });
});

describe('localforage session wrapper', () => {
  it('getOkapiSession retrieves a session object', async () => {
    const o = { user: {} };
    localforage.getItem = jest.fn(() => Promise.resolve(o));

    const s = await getOkapiSession();
    expect(s).toMatchObject(o);
  });

  describe('getTokenExpiry', () => {
    it('finds tokenExpiration', async () => {
      const o = { tokenExpiration: { trinity: 'cowboy junkies' } };
      localforage.getItem = jest.fn(() => Promise.resolve(o));

      const s = await getTokenExpiry();
      expect(s).toMatchObject(o.tokenExpiration);
    });

    it('handles missing tokenExpiration', async () => {
      const o = { nobody: 'here but us chickens' };
      localforage.getItem = jest.fn(() => Promise.resolve(o));

      const s = await getTokenExpiry();
      expect(s).toBeFalsy();
    });
  });

  it('setTokenExpiry set', async () => {
    const o = {
      margo: 'timmins',
      margot: 'margot with a t looks better',
      also: 'i thought we were talking about margot robbie?',
      tokenExpiration: 'time out of mind',
    };
    localforage.getItem = () => Promise.resolve(o);
    localforage.setItem = (k, v) => Promise.resolve(v);

    const te = {
      trinity: 'cowboy junkies',
      sweet: 'james',
    };

    const s = await setTokenExpiry(te);
    expect(s).toMatchObject({ ...o, tokenExpiration: te });
  });
});

describe('logout', () => {
  describe('when logout has started in this window', () => {
    it('returns immediately', async () => {
      const store = {
        dispatch: jest.fn(),
      };
      window.sessionStorage.clear();
      window.sessionStorage.setItem(IS_LOGGING_OUT, 'true');

      let res;
      await logout('', store)
        .then(() => {
          res = true;
        });
      expect(res).toBe(true);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('when logout has not started in this window', () => {
    afterEach(() => {
      mockFetchCleanUp();
    });

    it('clears the redux store', async () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
      const store = {
        dispatch: jest.fn(),
        getState: jest.fn(),
      };
      window.sessionStorage.clear();

      let res;
      await logout('', store)
        .then(() => {
          res = true;
        });
      expect(res).toBe(true);

      // expect(setItemSpy).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(setIsAuthenticated(false));
      expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
      expect(store.dispatch).toHaveBeenCalledWith(clearOkapiToken());
    });

    it('calls fetch() when other window is not logging out', async () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
      localStorage.setItem(SESSION_NAME, 'true');
      const store = {
        dispatch: jest.fn(),
        getState: jest.fn(),
      };
      window.sessionStorage.clear();

      let res;
      await logout('', store)
        .then(() => {
          res = true;
        });

      expect(res).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('does not call fetch() when other window is logging out', async () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
      localStorage.clear();
      const store = {
        dispatch: jest.fn(),
      };
      window.sessionStorage.clear();

      let res;
      await logout('', store)
        .then(() => {
          res = true;
        });

      expect(res).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
