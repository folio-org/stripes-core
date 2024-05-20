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

import okapiReducer from './okapiReducer';

describe('okapiReducer', () => {
  describe('SET_IS_AUTHENTICATED', () => {
    it('sets isAuthenticated to true', () => {
      const isAuthenticated = true;
      const o = okapiReducer({}, setIsAuthenticated(true));
      expect(o).toMatchObject({ isAuthenticated });
    });

    it('if isAuthenticated is false, clears rtr state', () => {
      const state = {
        rtrModalIsVisible: true,
        rtrTimeout: 123,
      };
      const ct = jest.spyOn(window, 'clearTimeout');
      const o = okapiReducer(state, setIsAuthenticated(false));
      expect(o.isAuthenticated).toBe(false);
      expect(o.rtrModalIsVisible).toBe(false);
      expect(o.rtrTimeout).toBe(undefined);
      expect(ct).toHaveBeenCalled();
    });
  });

  it('SET_LOGIN_DATA', () => {
    const loginData = 'loginData';
    const o = okapiReducer({}, setLoginData(loginData));
    expect(o).toMatchObject({ loginData });
  });

  it('UPDATE_CURRENT_USER', () => {
    const initialState = { funky: 'chicken' };
    const data = { monkey: 'bagel' };
    const o = okapiReducer(initialState, updateCurrentUser(data));
    expect(o).toMatchObject({ ...initialState, currentUser: { ...data } });
  });

  it('SET_SESSION_DATA', () => {
    const initialState = {
      perms: [],
      user: {},
      tenant: 'central',
    };
    const session = {
      perms: ['users.collection.get'],
      user: {
        user: {
          id: 'userId',
          username: 'admin',
        }
      },
      tenant: 'institutional',
    };
    const o = okapiReducer(initialState, setSessionData(session));
    const { user, perms, ...rest } = session;
    expect(o).toMatchObject({
      ...initialState,
      ...rest,
      currentUser: user,
      currentPerms: perms,
    });
  });

  it('SET_RTR_TIMEOUT', () => {
    const ct = jest.spyOn(window, 'clearTimeout');

    const state = {
      rtrTimeout: 991,
    };

    const newState = { rtrTimeout: 997 };

    const o = okapiReducer(state, setRtrTimeout(newState.rtrTimeout));
    expect(o).toMatchObject(newState);

    expect(ct).toHaveBeenCalledWith(state.rtrTimeout);
  });

  it('CLEAR_RTR_TIMEOUT', () => {
    const ct = jest.spyOn(window, 'clearTimeout');

    const state = {
      rtrTimeout: 991,
    };

    const o = okapiReducer(state, clearRtrTimeout());
    expect(o).toMatchObject({});
    expect(ct).toHaveBeenCalledWith(state.rtrTimeout);
  });

  it('TOGGLE_RTR_MODAL', () => {
    const rtrModalIsVisible = true;
    const o = okapiReducer({}, toggleRtrModal(true));
    expect(o).toMatchObject({ rtrModalIsVisible });
  });

  it('SET_OKAPI_TOKEN', () => {
    const token = 't';
    const o = okapiReducer({}, setOkapiToken(token));
    expect(o).toMatchObject({ token });
  });

  it('CLEAR_OKAPI_TOKEN', () => {
    const o = okapiReducer({}, clearOkapiToken());
    expect(o).toMatchObject({ token: null });
  });

  it('SET_CURRENT_USER', () => {
    const state = { currentUser: 'fred' };
    const currentUser = 'george';
    const o = okapiReducer(state, setCurrentUser(currentUser));
    expect(o).toMatchObject({ currentUser });
  });

  it('SET_LOCALE', () => {
    const state = { locale: 'fred' };
    const locale = 'george';
    const o = okapiReducer(state, setLocale(locale));
    expect(o).toMatchObject({ locale });
  });

  it('SET_TIMEZONE', () => {
    const state = { timezone: 'fred' };
    const timezone = 'george';
    const o = okapiReducer(state, setTimezone(timezone));
    expect(o).toMatchObject({ timezone });
  });

  it('SET_CURRENCY', () => {
    const state = { currency: 'fred' };
    const currency = 'george';
    const o = okapiReducer(state, setCurrency(currency));
    expect(o).toMatchObject({ currency });
  });

  it('SET_PLUGINS', () => {
    const state = { plugins: 'fred' };
    const plugins = 'george';
    const o = okapiReducer(state, setPlugins(plugins));
    expect(o).toMatchObject({ plugins });
  });

  it('SET_SINGLE_PLUGIN', () => {
    const state = { plugins: { tortured: 'poets' } };
    const o = okapiReducer(state, setSinglePlugin('tortured', 'apostrophes are nice'));
    expect(o).toMatchObject({ plugins: { tortured: 'apostrophes are nice' } });
  });

  it('SET_BINDINGS', () => {
    const state = { bindings: 'fred' };
    const bindings = 'george';
    const o = okapiReducer(state, setBindings(bindings));
    expect(o).toMatchObject({ bindings });
  });

  it('SET_CURRENT_PERMS', () => {
    const state = { currentPerms: 'fred' };
    const currentPerms = 'george';
    const o = okapiReducer(state, setCurrentPerms(currentPerms));
    expect(o).toMatchObject({ currentPerms });
  });

  it('SET_TOKEN_EXPIRATION', () => {
    const state = { loginData: { tokenExpiration: 'fred' } };
    const tokenExpiration = 'george';
    const o = okapiReducer(state, setTokenExpiration(tokenExpiration));
    expect(o).toMatchObject({ loginData: { tokenExpiration } });
  });

  it('CLEAR_CURRENT_USER', () => {
    const state = { currentUser: 'fred', currentPerms: 'all the perms' };
    const o = okapiReducer(state, clearCurrentUser());
    expect(o).toMatchObject({ currentUser: {}, currentPerms: {} });
  });

  it('SET_AUTH_FAILURE', () => {
    const state = { authFailure: 'fred' };
    const authFailure = 'george';
    const o = okapiReducer(state, setAuthError(authFailure));
    expect(o).toMatchObject({ authFailure });
  });

  it('SET_TRANSLATIONS', () => {
    const state = { translations: 'fred' };
    const translations = 'george';
    const o = okapiReducer(state, setTranslations(translations));
    expect(o).toMatchObject({ translations });
  });

  it('CHECK_SSO', () => {
    const state = { ssoEnabled: 'fred' };
    const ssoEnabled = 'george';
    const o = okapiReducer(state, checkSSO(ssoEnabled));
    expect(o).toMatchObject({ ssoEnabled });
  });

  it('OKAPI_READY', () => {
    const state = { okapiReady: false };
    const okapiReady = true;
    const o = okapiReducer(state, setOkapiReady());
    expect(o).toMatchObject({ okapiReady });
  });

  it('SERVER_DOWN', () => {
    const state = { serverDown: false };
    const serverDown = true;
    const o = okapiReducer(state, setServerDown());
    expect(o).toMatchObject({ serverDown });
  });




});
