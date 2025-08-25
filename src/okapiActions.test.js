import {
  checkSSO,
  clearCurrentUser,
  clearOkapiToken,
  clearRtrTimeout,
  setAuthError,
  setBindings,
  setCurrency,
  setCurrentPerms,
  setCurrentUser,
  setIsAuthenticated,
  setLocale,
  setLoginData,
  setOkapiReady,
  setOkapiToken,
  setPlugins,
  setRtrTimeout,
  setServerDown,
  setSessionData,
  setSinglePlugin,
  setTimezone,
  setTokenExpiration,
  setTranslations,
  toggleRtrModal,
  updateCurrentUser,
} from './okapiActions';


describe('checkSSO', () => {
  it('sets ssoEnabled', () => {
    expect(checkSSO('monkey').ssoEnabled).toBe('monkey');
  });
});

describe('clearCurrentUser', () => {
  it('returns an action with a type', () => {
    expect(clearCurrentUser()).toHaveProperty('type');
  });
});

describe('clearOkapiToken', () => {
  it('returns an action with a type', () => {
    expect(clearOkapiToken()).toHaveProperty('type');
  });
});

describe('clearRtrTimeout', () => {
  it('returns an action with a type', () => {
    expect(clearRtrTimeout()).toHaveProperty('type');
  });
});

describe('setAuthError', () => {
  it('sets message', () => {
    expect(setAuthError('message').message).toBe('message');
  });
});

describe('setBindings', () => {
  it('sets bindings', () => {
    expect(setBindings('bindings').bindings).toBe('bindings');
  });
});

describe('setCurrency', () => {
  it('sets currency', () => {
    expect(setCurrency('currency').currency).toBe('currency');
  });
});

describe('setCurrentPerms', () => {
  it('sets currentPerms', () => {
    expect(setCurrentPerms('currentPerms').currentPerms).toBe('currentPerms');
  });
});

describe('setCurrentUser', () => {
  it('sets currentUser', () => {
    expect(setCurrentUser('currentUser').currentUser).toBe('currentUser');
  });
});

describe('setIsAuthenticated', () => {
  it('handles truthy values', () => {
    expect(setIsAuthenticated('truthy').isAuthenticated).toBe(true);
    expect(setIsAuthenticated(1).isAuthenticated).toBe(true);
    expect(setIsAuthenticated(true).isAuthenticated).toBe(true);
  });

  it('handles falsey values', () => {
    expect(setIsAuthenticated('').isAuthenticated).toBe(false);
    expect(setIsAuthenticated(0).isAuthenticated).toBe(false);
    expect(setIsAuthenticated(false).isAuthenticated).toBe(false);
  });
});

describe('setLocale', () => {
  it('sets locale', () => {
    expect(setLocale('locale').locale).toBe('locale');
  });
});

describe('setLoginData', () => {
  it('receives given data in "loginData"', () => {
    const av = { monkey: 'bagel' };
    expect(setLoginData(av).loginData).toMatchObject(av);
  });
});

describe('setOkapiReady', () => {
  it('returns an action with a type', () => {
    expect(setOkapiReady()).toHaveProperty('type');
  });
});

describe('setOkapiToken', () => {
  it('sets token', () => {
    expect(setOkapiToken('token').token).toBe('token');
  });
});

describe('setPlugins', () => {
  it('sets plugins', () => {
    expect(setPlugins('plugins').plugins).toBe('plugins');
  });
});

describe('setRtrTimeout', () => {
  it('sets rtrTimeout', () => {
    expect(setRtrTimeout('rtrTimeout').rtrTimeout).toBe('rtrTimeout');
  });
});

describe('setServerDown', () => {
  it('returns an action with a type', () => {
    expect(setServerDown()).toHaveProperty('type');
  });
});

describe('setSessionData', () => {
  it('sets session', () => {
    expect(setSessionData('session').session).toBe('session');
  });
});

describe('setSinglePlugin', () => {
  it('sets name and value', () => {
    const ret = setSinglePlugin('name', 'value');
    expect(ret.name).toBe('name');
    expect(ret.value).toBe('value');
  });
});

describe('setTimezone', () => {
  it('sets timezone', () => {
    expect(setTimezone('timezone').timezone).toBe('timezone');
  });
});

describe('setTokenExpiration', () => {
  it('sets tokenExpiration', () => {
    expect(setTokenExpiration('tokenExpiration').tokenExpiration).toBe('tokenExpiration');
  });
});

describe('setTranslations', () => {
  it('sets translations', () => {
    expect(setTranslations('translations').translations).toBe('translations');
  });
});

describe('toggleRtrModal', () => {
  it('sets isVisible', () => {
    expect(toggleRtrModal(true).isVisible).toBe(true);
  });
});

describe('updateCurrentUser', () => {
  it('receives given data in "data"', () => {
    const av = { monkey: 'bagel' };
    expect(updateCurrentUser(av).data).toMatchObject(av);
  });
});
