import localforage from 'localforage';

import {
  createOkapiSession,
  handleLoginError,
  handleServiceWorkerMessage,
  loadTranslations,
  processOkapiSession,
  spreadUserWithPerms,
  supportedLocales,
  supportedNumberingSystems,
  updateTenant,
  updateUser,
  validateUser,
} from './loginServices';

import { resetStore } from './mainActions';

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
  setTokenExpiration,
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
  it('clears authentication errors and sends a TOKEN_EXPIRATION message', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
        }
      }),
    };

    const postMessage = jest.fn();
    navigator.serviceWorker = {
      controller: true,
      ready: Promise.resolve({
        active: {
          postMessage,
        }
      })
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

    await createOkapiSession('url', store, 'tenant', data);
    expect(store.dispatch).toHaveBeenCalledWith(setAuthError(null));
    expect(store.dispatch).toHaveBeenCalledWith(setLoginData(data));
    expect(store.dispatch).toHaveBeenCalledWith(setCurrentPerms(permissionsMap));

    const message = {
      source: '@folio/stripes-core',
      type: 'TOKEN_EXPIRATION',
      value: {
        tokenExpiration: {
          atExpires: new Date('2023-11-06T18:05:33Z').getTime(),
          rtExpires: new Date('2023-10-30T18:15:33Z').getTime(),
        },
      }
    };
    expect(postMessage).toHaveBeenCalledWith(message);

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

    const postMessage = jest.fn();
    navigator.serviceWorker = {
      controller: true,
      ready: Promise.resolve({
        active: {
          postMessage,
        }
      })
    };

    // set a fixed system time so date math is stable
    const now = new Date('2023-10-30T19:34:56.000Z');
    jest.useFakeTimers().setSystemTime(now);

    await validateUser('url', store, tenant, session);

    expect(store.dispatch).nthCalledWith(1, setAuthError(null));
    expect(store.dispatch).nthCalledWith(2, setLoginData(data));

    const message = {
      source: '@folio/stripes-core',
      type: 'TOKEN_EXPIRATION',
      value: {
        tokenExpiration: {
          atExpires: -1,
          rtExpires: new Date(now).getTime() + (10 * 60 * 1000),
        },
      },
    };
    expect(postMessage).toHaveBeenCalledWith(message);

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
    navigator.serviceWorker = {
      ready: Promise.resolve({})
    };

    await validateUser('url', store, tenant, session);
    expect(store.dispatch).nthCalledWith(1, setAuthError(null));
    expect(store.dispatch).nthCalledWith(2, setLoginData(data));

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


describe('handleServiceWorkerMessage', () => {
  const store = {
    dispatch: jest.fn(),
    getState: () => ({
      okapi: {
        currentPerms: [],
      }
    }),
  };

  beforeEach(() => {
    delete window.location;
  });

  describe('ignores cross-origin events', () => {
    it('mismatched event origin', () => {
      window.location = new URL('https://www.barbie.com');
      const event = { origin: '' };

      handleServiceWorkerMessage(event, store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('missing event origin', () => {
      window.location = new URL('https://www.barbie.com');
      const event = { origin: 'https://www.openheimer.com' };

      handleServiceWorkerMessage(event, store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('handles same-origin events', () => {
    it('only handles events if data.source is "@folio/stripes-core"', () => {
      window.location = new URL('https://www.barbie.com');
      const event = {
        origin: 'https://www.barbie.com',
        data: {
          source: 'monkey-bagel'
        }
      };

      handleServiceWorkerMessage(event, store);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('on RTR, dispatches new token-expiration data', () => {
      window.location = new URL('https://www.barbie.com');
      const tokenExpiration = {
        atExpires: '2023-11-06T18:05:33.000Z',
        rtExpires: '2023-10-30T18:15:33.000Z',
      };

      const event = {
        origin: 'https://www.barbie.com',
        data: {
          source: '@folio/stripes-core',
          type: 'TOKEN_EXPIRATION',
          value: { tokenExpiration },
        }
      };

      handleServiceWorkerMessage(event, store);
      expect(store.dispatch).toHaveBeenCalledWith(setTokenExpiration({ ...tokenExpiration }));
    });

    it('on RTR error, ends session', () => {
      window.location = new URL('https://www.oppenheimer.com');
      const tokenExpiration = {
        atExpires: '2023-11-06T18:05:33.000Z',
        rtExpires: '2023-10-30T18:15:33.000Z',
      };

      const event = {
        origin: 'https://www.oppenheimer.com',
        data: {
          source: '@folio/stripes-core',
          type: 'RTR_ERROR',
          tokenExpiration,
        }
      };

      handleServiceWorkerMessage(event, store);
      expect(store.dispatch).toHaveBeenCalledWith(setIsAuthenticated(false));
      expect(store.dispatch).toHaveBeenCalledWith(clearCurrentUser());
      expect(store.dispatch).toHaveBeenCalledWith(resetStore());
    });
  });
});

