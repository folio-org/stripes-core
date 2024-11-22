import localforage from 'localforage';

import {
  checkOkapiSession,
  createOkapiSession,
  getOkapiSession,
  getTokenExpiry,
  handleLoginError,
  loadTranslations,
  processOkapiSession,
  setTokenExpiry,
  spreadUserWithPerms,
  supportedLocales,
  supportedNumberingSystems,
  updateTenant,
  updateUser,
  validateUser,
} from './loginServices';



import {
  clearCurrentUser,
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
  // setSessionData,
  // setTokenExpiration,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';

import { defaultErrors } from './constants';

// reassign console.log to keep things quiet
const consoleInterruptor = {};
beforeAll(() => {
  consoleInterruptor.log = global.console.log;
  consoleInterruptor.error = global.console.error;
  consoleInterruptor.warn = global.console.warn;
  console.log = () => { };
  console.error = () => { };
  console.warn = () => { };
});

afterAll(() => {
  global.console.log = consoleInterruptor.log;
  global.console.error = consoleInterruptor.error;
  global.console.warn = consoleInterruptor.warn;
});

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

    await createOkapiSession('url', store, 'tenant', 'token', data);
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

    await processOkapiSession('url', store, 'tenant', resp);
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

    await processOkapiSession('url', store, 'tenant', resp);

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

  it('handles invalid user', async () => {
    const store = {
      dispatch: jest.fn(),
    };

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ ok: false });
    });

    await validateUser('url', store, 'tenant', {});
    expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
    mockFetchCleanUp();
  });
});

describe('updateUser', () => {
  it('dispatches updateCurrentUser when a session exists', async () => {
    const s = {
      user: { id: 'robert' },
      tenant: 'manhattan',
      isAuthenticated: 'i am',
    };
    localforage.getItem = () => Promise.resolve(s);

    const store = {
      dispatch: jest.fn(),
    };
    const data = { thunder: 'chicken' };
    await updateUser(store, data);
    expect(store.dispatch).toHaveBeenCalledWith(updateCurrentUser(data));
  });

  it('does nothing when session is not found', async () => {
    localforage.getItem = () => Promise.resolve(null);

    const store = {
      dispatch: jest.fn(),
    };
    const data = { thunder: 'chicken' };
    await updateUser(store, data);
    expect(store.dispatch).not.toHaveBeenCalled();
  });
});

describe('updateTenant', () => {
  const s = {
    user: { id: 'robert' },
    tenant: 'manhattan',
    isAuthenticated: 'i am',
  };

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

  it('updates tenant and user when session exists', async () => {
    localforage.getItem = () => Promise.resolve(s);
    localforage.setItem = jest.fn(() => Promise.resolve(s));

    mockFetchSuccess(data);
    await updateTenant(okapi, tenant);
    mockFetchCleanUp();

    expect(localforage.setItem).toHaveBeenCalledWith('okapiSess', {
      ...s,
      ...spreadUserWithPerms(data),
      tenant,
    });
  });

  it('does nothing when session is not found', async () => {
    localforage.getItem = () => Promise.resolve(null);

    mockFetchSuccess(data);
    await updateTenant(okapi, tenant);
    mockFetchCleanUp();

    expect(localforage.setItem).not.toHaveBeenCalled();
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

  describe('setTokenExpiry', () => {
    it('saves data when a session exists', async () => {
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

    it('does nothing when session does not exist', async () => {
      const o = null;
      localforage.getItem = () => Promise.resolve(o);
      localforage.setItem = (k, v) => Promise.resolve(v);

      const te = {
        now: 'i am become death, destroyer of sessions',
      };

      const s = await setTokenExpiry(te);
      expect(s).toBeNull();
    });
  });
});

describe('checkOkapiSession', () => {
  it('dispatches setOkapiReady', async () => {
    const o = {
      user: { id: 'id' },
      tenant: 'tenant',
      isAuthenticated: true,
    };
    localforage.getItem = jest.fn(() => Promise.resolve(o));
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const data = { data: 'd' };

    mockFetchSuccess(data);

    await checkOkapiSession('url', store, o.tenant);
    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady());

    mockFetchCleanUp();
  });

  it('when getOkapiSession returns full session data, validates it', async () => {
    const o = {
      user: { id: 'id' },
      tenant: 'tenant',
      isAuthenticated: true,
    };
    localforage.getItem = jest.fn(() => Promise.resolve(o));
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const data = { data: 'd' };

    mockFetchSuccess(data);

    await checkOkapiSession('url', store, 'tenant');

    expect(store.dispatch).toHaveBeenCalledWith(setAuthError(null));
    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady());

    mockFetchCleanUp();
  });

  it('when getOkapiSession returns sparse session data, ignores it', async () => {
    const o = { monkey: 'bagel' };
    localforage.getItem = jest.fn(() => Promise.resolve(o));
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const data = { data: 'd' };

    mockFetchSuccess(data);

    await checkOkapiSession('url', store, o.tenant);

    expect(store.dispatch).not.toHaveBeenCalledWith(setAuthError(null));
    expect(store.dispatch).not.toHaveBeenCalledWith(setLoginData(data));
    expect(store.dispatch).toHaveBeenCalledWith(setOkapiReady(null));

    mockFetchCleanUp();
  });
});
