import localforage from 'localforage';

import {
  createOkapiSession,
  getBindings,
  getLocale,
  getLoginTenant,
  getPlugins,
  getOkapiSession,
  getTokenExpiry,
  getUnauthorizedPathFromSession,
  getUserLocale,
  handleLoginError,
  loadTranslations,
  logout,
  processOkapiSession,
  removeUnauthorizedPathFromSession,
  setTokenExpiry,
  setUnauthorizedPathToSession,
  spreadUserWithPerms,
  supportedLocales,
  supportedNumberingSystems,
  updateTenant,
  updateUser,
  validateUser,
  IS_LOGGING_OUT,
  SESSION_NAME,
  requestLogin,
  requestUserWithPerms,
  fetchOverriddenUserWithPerms,
  loadResources,
  getOIDCRedirectUri,
  getLogoutTenant,
} from './loginServices';

import { discoverServices } from './discoverServices';

import {
  clearCurrentUser,
  clearOkapiToken,
  setCurrentPerms,
  setLocale,
  setTimezone,
  setCurrency,
  setPlugins,
  setBindings,
  // setTranslations,
  setAuthError,
  // checkSSO,
  setIsAuthenticated,
  setOkapiReady,
  // setServerDown,
  setSessionData,
  // setTokenExpiration,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';

import { defaultErrors } from './constants';

jest.mock('./loginServices', () => ({
  ...jest.requireActual('./loginServices'),
  fetchOverriddenUserWithPerms: jest.fn()
}));

jest.mock('./discoverServices', () => ({
  ...jest.requireActual('./discoverServices'),
  discoverServices: jest.fn().mockResolvedValue([]),
}));

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
      status: 200,
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
  global.fetch?.mockClear();
  delete global.fetch;
};

describe('createOkapiSession', () => {
  it('clears authentication errors', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({
        okapi: {
          currentPerms: [],
          url: 'okapiUrl'
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
          authnUrl: 'keycloakURL'
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
      getState: () => ({ okapi: { tenant: 'monkey', url: 'monkeyUrl' } }),
    };
    const handleError = jest.fn().mockReturnValue(Promise.resolve());

    mockFetchError();

    const res = await validateUser('url', store, 'tenant', {}, handleError);
    expect(handleError).toHaveBeenCalled();
    expect(res).toBeUndefined();
    mockFetchCleanUp();
  });

  it('handles valid user with empty tenant in session', async () => {
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: { tenant: 'monkey', url: 'monkeyUrl', currentPerms: { 'configuration.entries.collection.get': true } } }),
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
      getState: () => ({ okapi: { tenant: 'monkey', url: 'monkeyUrl' } }),
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
      getState: () => ({ okapi: { tenant: 'monkey', url: 'monkeyUrl' } }),
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
      user: {
        id: 'id',
        username: 'username',
        storageOnlyValue: 'is still persisted',
      },
      perms: { foo: true },
      tenant: sessionTenant,
      token: 'token',
    };

    mockFetchSuccess(data);

    await validateUser('url', store, tenant, session);

    const updatedSession = {
      user: { ...session.user, ...data.user },
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
      getState: () => ({ okapi: { tenant: 'monkey', url: 'monkeyUrl' } }),
    };
    const handleError = jest.fn().mockReturnValue(Promise.resolve());

    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ ok: false, text: () => Promise.resolve('boom') });
    });

    const res = await validateUser('url', store, 'tenant', {}, handleError);
    expect(handleError).toHaveBeenCalled();
    expect(res).toBeUndefined();
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

  describe('react-query client', () => {
    afterEach(() => {
      mockFetchCleanUp();
    });

    it('calls removeQueries given valid client', async () => {
      global.fetch = jest.fn().mockImplementation(() => Promise.resolve());
      const store = {
        dispatch: jest.fn(),
      };
      const rqc = {
        removeQueries: jest.fn(),
      };

      let res;
      await logout('', store, rqc)
        .then(() => {
          res = true;
        });

      expect(res).toBe(true);
      expect(rqc.removeQueries).toHaveBeenCalled();
    });
  });
});

describe('getLocale', () => {
  it('dispatches setTimezone, setCurrency', async () => {
    const value = { timezone: 'America/New_York', currency: 'USD' };
    mockFetchSuccess({ configs: [{ value: JSON.stringify(value) }] });
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: {} }),
    };
    await getLocale('url', store, 'tenant');
    expect(store.dispatch).toHaveBeenCalledWith(setTimezone(value.timezone));
    expect(store.dispatch).toHaveBeenCalledWith(setCurrency(value.currency));
    mockFetchCleanUp();
  });
});

describe('getUserLocale', () => {
  it('dispatches setTimezone, setCurrency', async () => {
    const value = { locale: 'en-US', timezone: 'America/New_York', currency: 'USD' };
    mockFetchSuccess({ configs: [{ value: JSON.stringify(value) }] });
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: {} }),
    };
    await getUserLocale('url', store, 'tenant');
    expect(store.dispatch).toHaveBeenCalledWith(setTimezone(value.timezone));
    expect(store.dispatch).toHaveBeenCalledWith(setCurrency(value.currency));
    mockFetchCleanUp();
  });
});

describe('getPlugins', () => {
  it('dispatches setPlugins', async () => {
    const configs = [
      { configName: 'find-user', value: '@folio/plugin-hello-waldo' },
      { configName: 'find-water', value: '@folio/plugin-dowsing-rod' },
    ];
    mockFetchSuccess({ configs });
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: {} }),
    };
    await getPlugins('url', store, 'tenant');

    const mappedConfigs = configs.reduce((acc, val) => ({
      ...acc,
      [val.configName]: val.value,
    }), {});
    expect(store.dispatch).toHaveBeenCalledWith(setPlugins(mappedConfigs));
    mockFetchCleanUp();
  });
});

describe('getBindings', () => {
  it('dispatches setBindings', async () => {
    const value = { key: 'value' };
    mockFetchSuccess({ configs: [{ value: JSON.stringify(value) }] });
    const store = {
      dispatch: jest.fn(),
      getState: () => ({ okapi: {} }),
    };
    await getBindings('url', store, 'tenant');
    expect(store.dispatch).toHaveBeenCalledWith(setBindings(value));
    mockFetchCleanUp();
  });
});

describe('unauthorizedPath functions', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  describe('removeUnauthorizedPathFromSession', () => {
    it('clears the value', () => {
      setUnauthorizedPathToSession('monkey');
      removeUnauthorizedPathFromSession();
      expect(getUnauthorizedPathFromSession()).toBe(null);
    });
  });

  describe('setUnauthorizedPathToSession', () => {
    it('stores the given value', () => {
      const value = 'monkey';
      setUnauthorizedPathToSession(value);
      expect(getUnauthorizedPathFromSession()).toBe(value);
    });

    it('stores the current location given no value', () => {
      window.location.pathname = '/some-path';
      window.location.search = '?monkey=bagel';
      setUnauthorizedPathToSession();
      expect(getUnauthorizedPathFromSession()).toBe(`${window.location.pathname}${window.location.search}`);
    });

    describe('refuses to set locations beginning with "/logout"', () => {
      it('with an argument', () => {
        const monkey = '/logout-timeout';
        setUnauthorizedPathToSession(monkey);
        expect(getUnauthorizedPathFromSession()).toBeFalsy();
      });

      it('without an argument', () => {
        window.location.pathname = '/logout-timeout';
        setUnauthorizedPathToSession();
        expect(getUnauthorizedPathFromSession()).toBeFalsy();
      });
    });
  });

  describe('getUnauthorizedPathFromSession', () => {
    it('retrieves the value', () => {
      const value = 'monkey';
      setUnauthorizedPathToSession(value);
      expect(getUnauthorizedPathFromSession()).toBe(value);
    });
  });

  describe('getLogoutTenant', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('retrieves the value from localstorage', () => {
      const value = { tenantId: 'diku' };
      localStorage.setItem('tenant', JSON.stringify(value));
      const parsedTenant = getLogoutTenant();
      expect(parsedTenant).toStrictEqual(value);
    });
  });

  describe('getOIDCRedirectUri', () => {
    it('should return encoded return_uri', () => {
      window.location.protocol = 'http';
      window.location.host = 'localhost';

      const tenant = 'tenant';
      const clientId = 'client_id';

      expect(getOIDCRedirectUri(tenant, clientId)).toEqual('http%3A%2F%2Flocalhost%2Foidc-landing%3Ftenant%3Dtenant%26client_id%3Dclient_id');
    });
  });

  describe('requestLogin', () => {
    afterEach(() => {
      mockFetchCleanUp();
    });

    it('should authenticate and create session when valid credentials provided', async () => {
      const mockStore = {
        getState: () => ({
          okapi: {},
        }),
        dispatch: jest.fn()
      };
      mockFetchSuccess({});

      await requestLogin(
        'http://okapi-url',
        mockStore,
        'test-tenant',
        { username: 'testuser', password: 'testpass' }
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/bl-users/login-with-expiry?expandPermissions=true&fullPermissions=true',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Okapi-Tenant': 'test-tenant',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('requestUserWithPerms', () => {
    afterEach(() => {
      mockFetchCleanUp();
      jest.clearAllMocks();
    });
    it('should authenticate and create session when valid credentials provided', async () => {
      mockFetchSuccess({ tenant: 'tenant', originalTenantId: 'originalTenantId', ok: true });
      const mockStore = {
        getState: () => ({
          okapi: {},
        }),
        dispatch: jest.fn()
      };

      await requestUserWithPerms(
        'http://okapi-url',
        mockStore,
        'test-tenant',
        'token'
      );

      expect(global.fetch).toHaveBeenCalledWith('http://okapi-url/users-keycloak/_self?expandPermissions=true&fullPermissions=true&overrideUser=true',
        {
          headers: expect.objectContaining({
            'X-Okapi-Tenant': 'test-tenant',
            'X-Okapi-Token': 'token',
            'Content-Type': 'application/json',
          }),
          'rtrIgnore': false
        });
    });

    it('should reject with an error object when response is not ok', async () => {
      const mockError = { message: 'Permission denied' };
      const mockStore = {
        getState: () => ({
          okapi: {},
        }),
        dispatch: jest.fn()
      };
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue(mockError), // Ensure `json()` is async
      };
      global.fetch = jest.fn().mockImplementation(() => (
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve('Reject message'),
          headers: new Map(),
        })));
      fetchOverriddenUserWithPerms.mockResolvedValue(mockResponse);

      await expect(requestUserWithPerms('okapiUrl', mockStore, 'tenant', true)).rejects.toEqual('Reject message');
      mockFetchCleanUp();
    });
  });
});

describe('loadResources', () => {
  let store;
  let loadResourcesResult;

  const tenantLocaleData = {
    items: [{
      id: 'tenantDataId',
      value: {
        locale: 'en-US',
        numberingSystem: 'latn',
        timezone: 'America/New_York',
        currency: 'USD',
      },
    }],
  };

  const userLocaleData = {
    items: [
      {
        id: 'userDataId',
        value: {
          locale: 'en-GB',
          timezone: 'Europe/London',
          currency: 'GBP',
        },
      },
    ],
  };

  const getResponseData = (url) => {
    if (url?.includes('key=="tenantLocaleSettings"')) return tenantLocaleData;
    if (url?.includes('key=="localeSettings"')) return userLocaleData;

    return { url };
  };

  beforeEach(() => {
    store = {
      dispatch: jest.fn(),
      getState: jest.fn().mockReturnValue({
        okapi: {
          url: 'http://okapi-url',
          currentPerms: {}
        }
      }),
    };

    discoverServices.mockResolvedValue({ url: 'discoverServices' });
  });

  afterEach(() => {
    mockFetchCleanUp();
    discoverServices.mockRestore();
    jest.clearAllMocks();
  });

  describe('when there are permissions to read mod-settings and mod-configuration', () => {
    beforeEach(() => {
      store.getState.mockReturnValue({
        okapi: {
          url: 'http://okapi-url',
          currentPerms: {
            'mod-settings.entries.collection.get': true,
            'mod-settings.owner.read.stripes-core.prefs.manage': true,
            'configuration.entries.collection.get': true,
          },
        },
      });
    });

    describe('when the user and tenant locale settings are present in mod-settings', () => {
      beforeEach(() => {
        global.fetch = jest.fn().mockImplementation((url) => Promise.resolve({
          url,
          json: () => Promise.resolve(getResponseData(url)),
        }));
      });

      it('should fetch the tenant and user locale settings from mod-settings', async () => {
        await loadResources(store, 'tenant', 'userId');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/settings/entries?query=(userId=="userId" and scope=="stripes-core.prefs.manage" and key=="localeSettings")',
          expect.anything(),
        );
      });

      it('should not fetch the tenant and user locale settings from mod-configuration', async () => {
        await loadResources(store, 'tenant', 'userId');

        expect(global.fetch).not.toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=(module==ORG AND configName == localeSettings AND (cql.allRecords=1 NOT userId="" NOT code=""))',
          expect.anything(),
        );
        expect(global.fetch).not.toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=("configName"=="localeSettings" AND "module"=="@folio/stripes-core" and userId=="userId")',
          expect.anything(),
        );
      });

      it('should fetch the plugins and bindings', async () => {
        await loadResources(store, 'tenant', 'userId');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
          expect.anything(),
        );
      });

      describe('when both the tenant and user locale settings are present', () => {
        it('should apply user locale settings', async () => {
          const timezone = userLocaleData.items[0].value.timezone;
          const currency = userLocaleData.items[0].value.currency;

          await loadResources(store, 'tenant', 'userId');

          expect(store.dispatch).toHaveBeenCalledWith(setTimezone(timezone));
          expect(store.dispatch).toHaveBeenCalledWith(setCurrency(currency));
        });
      });

      describe('when the user locale settings are missing something other than the locale', () => {
        it('should take it from tenant locale settings', async () => {
          await loadResources(store, 'tenant', 'userId');

          expect(document.documentElement.lang).toBe('en-GB-u-nu-latn');
        });
      });

      it('should wait for the following requests', async () => {
        loadResourcesResult = await loadResources(store, 'tenant', 'userId');

        expect(loadResourcesResult.map(({ url }) => url)).toEqual([
          'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
          'http://okapi-url/settings/entries?query=(userId=="userId" and scope=="stripes-core.prefs.manage" and key=="localeSettings")',
          'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
          'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
          'discoverServices',
        ]);
      });
    });

    describe('when the user or tenant locale settings are not present in mod-settings', () => {
      const getData = (url) => {
        // if mod-settings API
        if (url?.includes('key=="tenantLocaleSettings"') || url?.includes('key=="localeSettings"')) {
          return { url, items: [] };
        }

        // if mod-configuration API
        if (url?.includes('configName == localeSettings') || url?.includes('"configName"=="localeSettings"')) {
          return {
            url,
            configs: [{
              value: JSON.stringify({
                locale: 'en-GB-u-nu-latn',
                timezone: 'UTC',
                currency: 'USD'
              }),
            }],
          };
        }

        return { url };
      };

      beforeEach(() => {
        global.fetch = jest.fn().mockImplementation((url) => Promise.resolve({
          url,
          json: () => Promise.resolve(getData(url)),
          ok: true,
        }));
      });

      it('should fetch the tenant and user locale settings from mod-settings and mod-configuration', async () => {
        await loadResources(store, 'tenant', 'userId');

        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/settings/entries?query=(userId=="userId" and scope=="stripes-core.prefs.manage" and key=="localeSettings")',
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=(module==ORG AND configName == localeSettings AND (cql.allRecords=1 NOT userId="" NOT code=""))',
          expect.anything(),
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'http://okapi-url/configurations/entries?query=("configName"=="localeSettings" AND "module"=="@folio/stripes-core" and userId=="userId")',
          expect.anything(),
        );
      });

      it('should apply locale settings from mod-configuration', async () => {
        await loadResources(store, 'tenant', 'userId');

        expect(store.dispatch).toHaveBeenCalledWith(setTimezone('UTC'));
        expect(store.dispatch).toHaveBeenCalledWith(setCurrency('USD'));
        expect(document.documentElement.lang).toBe('en-GB-u-nu-latn');
      });

      it('should wait for the following requests', async () => {
        loadResourcesResult = await loadResources(store, 'tenant', 'userId');

        expect(loadResourcesResult.map(({ url }) => url)).toEqual([
          'http://okapi-url/configurations/entries?query=(module==ORG AND configName == localeSettings AND (cql.allRecords=1 NOT userId="" NOT code=""))',
          'http://okapi-url/configurations/entries?query=("configName"=="localeSettings" AND "module"=="@folio/stripes-core" and userId=="userId")',
          'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
          'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
          'discoverServices',
        ]);
      });
    });
  });

  describe('when there is permission to only read tenant settings from mod-settings', () => {
    beforeEach(() => {
      store.getState.mockReturnValue({
        okapi: {
          url: 'http://okapi-url',
          currentPerms: {
            'mod-settings.entries.collection.get': true,
            'mod-settings.global.read.stripes-core.prefs.manage': true,
          },
        },
      });

      global.fetch = jest.fn().mockImplementation(url => {
        if (url?.includes('key=="localeSettings"')) {
          return Promise.reject(new Error('Request failed'));
        }

        return Promise.resolve({
          url,
          json: () => Promise.resolve(getResponseData(url)),
        });
      });
    });

    it('should fetch the tenant and user locale settings from mod-settings', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
        expect.anything(),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/settings/entries?query=(userId=="userId" and scope=="stripes-core.prefs.manage" and key=="localeSettings")',
        expect.anything(),
      );
    });

    it('should not fetch the plugins and bindings', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(global.fetch).not.toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
        expect.anything(),
      );
      expect(global.fetch).not.toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
        expect.anything(),
      );
    });

    it('should apply tenant locale settings', async () => {
      const timezone = tenantLocaleData.items[0].value.timezone;
      const currency = tenantLocaleData.items[0].value.currency;

      await loadResources(store, 'tenant', 'userId');

      expect(store.dispatch).toHaveBeenCalledWith(setTimezone(timezone));
      expect(store.dispatch).toHaveBeenCalledWith(setCurrency(currency));
      expect(document.documentElement.lang).toBe('en-US-u-nu-latn');
    });

    it('should wait for the following requests', async () => {
      loadResourcesResult = await loadResources(store, 'tenant', 'userId');

      expect(loadResourcesResult.map(({ url } = {}) => url)).toEqual([
        'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
        undefined, // rejected request for user locale
        'discoverServices',
      ]);
    });
  });

  describe('when there is permission to only read mod-configuration', () => {
    beforeEach(() => {
      store.getState = jest.fn().mockReturnValue({
        okapi: {
          url: 'http://okapi-url',
          currentPerms: {
            'configuration.entries.collection.get': true,
          },
        },
      });

      const getData = (url) => {
        // mod-configuration locales
        if (url?.includes('configName == localeSettings') || url?.includes('"configName"=="localeSettings"')) {
          return {
            url,
            configs: [{
              value: JSON.stringify({
                locale: 'en-GB-u-nu-latn',
                timezone: 'UTC',
                currency: 'USD'
              }),
            }],
          };
        }

        return { url };
      };

      global.fetch = jest.fn().mockImplementation((url) => Promise.resolve({
        url,
        json: () => Promise.resolve(getData(url)),
        ok: true,
      }));
    });

    it('should not fetch the tenant and user locale settings from mod-settings', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(global.fetch).not.toHaveBeenCalledWith(
        'http://okapi-url/settings/entries?query=(scope=="stripes-core.prefs.manage" and key=="tenantLocaleSettings")',
        expect.anything(),
      );
      expect(global.fetch).not.toHaveBeenCalledWith(
        'http://okapi-url/settings/entries?query=(userId=="userId" and scope=="stripes-core.prefs.manage" and key=="localeSettings")',
        expect.anything(),
      );
    });

    it('should fetch the tenant and user locale settings from mod-configuration', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=(module==ORG AND configName == localeSettings AND (cql.allRecords=1 NOT userId="" NOT code=""))',
        expect.anything(),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=("configName"=="localeSettings" AND "module"=="@folio/stripes-core" and userId=="userId")',
        expect.anything(),
      );
    });

    it('should fetch the plugins and bindings', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
        expect.anything(),
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
        expect.anything(),
      );
    });

    it('should apply locale settings', async () => {
      await loadResources(store, 'tenant', 'userId');

      expect(store.dispatch).toHaveBeenCalledWith(setTimezone('UTC'));
      expect(store.dispatch).toHaveBeenCalledWith(setCurrency('USD'));
      expect(document.documentElement.lang).toBe('en-GB-u-nu-latn');
    });

    it('should wait for the following requests', async () => {
      loadResourcesResult = await loadResources(store, 'tenant', 'userId');

      expect(loadResourcesResult.map(({ url }) => url)).toEqual([
        'http://okapi-url/configurations/entries?query=(module==ORG AND configName == localeSettings AND (cql.allRecords=1 NOT userId="" NOT code=""))',
        'http://okapi-url/configurations/entries?query=("configName"=="localeSettings" AND "module"=="@folio/stripes-core" and userId=="userId")',
        'http://okapi-url/configurations/entries?query=(module==PLUGINS)',
        'http://okapi-url/configurations/entries?query=(module==ORG and configName==bindings)',
        'discoverServices',
      ]);
    });
  });

  it('should fetch discoverServices when okapi is available', async () => {
    await loadResources(store, 'tenant', 'userId');

    expect(discoverServices).toHaveBeenCalledWith(store);
  });
});

describe('getLoginTenant', () => {
  it('uses URL values when present', () => {
    const search = { tenant: 't', client_id: 'c' };
    Object.defineProperty(window, 'location', { value: { search } });

    const res = getLoginTenant({}, {});
    expect(res.tenant).toBe(search.tenant);
    expect(res.clientId).toBe(search.client_id);
  });

  describe('single-tenant', () => {
    it('uses config.tenantOptions values when URL values are absent', () => {
      const config = {
        tenantOptions: {
          denzel: { name: 'denzel', clientId: 'nolan' }
        }
      };

      const res = getLoginTenant({}, config);
      expect(res.tenant).toBe(config.tenantOptions.denzel.name);
      expect(res.clientId).toBe(config.tenantOptions.denzel.clientId);
    });

    it('uses okapi.tenant and okapi.clientId when config.tenantOptions is missing', () => {
      const okapi = {
        tenant: 't',
        clientId: 'c',
      };

      const res = getLoginTenant(okapi, {});
      expect(res.tenant).toBe(okapi.tenant);
      expect(res.clientId).toBe(okapi.clientId);
    });

    it('returns undefined when all options are exhausted', () => {
      const res = getLoginTenant();
      expect(res.tenant).toBeUndefined();
      expect(res.clientId).toBeUndefined();
    });
  });

  describe('ECS', () => { });
});

