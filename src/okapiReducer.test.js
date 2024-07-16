import okapiReducer, { OKAPI_REDUCER_ACTIONS } from './okapiReducer';


describe('okapiReducer', () => {
  describe('SET_IS_AUTHENTICATED', () => {
    it('sets isAuthenticated to true', () => {
      const isAuthenticated = true;
      const o = okapiReducer({}, { type: OKAPI_REDUCER_ACTIONS.SET_IS_AUTHENTICATED, isAuthenticated: true });
      expect(o).toMatchObject({ isAuthenticated });
    });

    it('if isAuthenticated is false, clears rtr state', () => {
      const state = {
        rtrModalIsVisible: true,
        rtrTimeout: 123,
      };
      const ct = jest.spyOn(window, 'clearTimeout');
      const o = okapiReducer(state, { type: OKAPI_REDUCER_ACTIONS.SET_IS_AUTHENTICATED, isAuthenticated: false });
      expect(o.isAuthenticated).toBe(false);
      expect(o.rtrModalIsVisible).toBe(false);
      expect(o.rtrTimeout).toBe(undefined);
      expect(o.rtrFlsTimeout).toBe(undefined);
      expect(ct).toHaveBeenCalled();
    });
  });

  it('SET_LOGIN_DATA', () => {
    const loginData = 'loginData';
    const o = okapiReducer({}, { type: OKAPI_REDUCER_ACTIONS.SET_LOGIN_DATA, loginData });
    expect(o).toMatchObject({ loginData });
  });

  it('UPDATE_CURRENT_USER', () => {
    const initialState = { funky: 'chicken' };
    const data = { monkey: 'bagel' };
    const o = okapiReducer(initialState, { type: OKAPI_REDUCER_ACTIONS.UPDATE_CURRENT_USER, data });
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
    const o = okapiReducer(initialState, { type: OKAPI_REDUCER_ACTIONS.SET_SESSION_DATA, session });
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

    const o = okapiReducer(state, { type: OKAPI_REDUCER_ACTIONS.SET_RTR_TIMEOUT, rtrTimeout: newState.rtrTimeout });
    expect(o).toMatchObject(newState);

    expect(ct).toHaveBeenCalledWith(state.rtrTimeout);
  });

  it('CLEAR_RTR_TIMEOUT', () => {
    const ct = jest.spyOn(window, 'clearTimeout');

    const state = {
      rtrTimeout: 991,
    };

    const o = okapiReducer(state, { type: OKAPI_REDUCER_ACTIONS.CLEAR_RTR_TIMEOUT });
    expect(o).toMatchObject({});
    expect(ct).toHaveBeenCalledWith(state.rtrTimeout);
  });

  it('TOGGLE_RTR_MODAL', () => {
    const rtrModalIsVisible = true;
    const o = okapiReducer({}, { type: OKAPI_REDUCER_ACTIONS.TOGGLE_RTR_MODAL, isVisible: true });
    expect(o).toMatchObject({ rtrModalIsVisible });
  });

  it('SET_RTR_FLS_TIMEOUT', () => {
    const ct = jest.spyOn(window, 'clearTimeout');

    const state = {
      rtrFlsTimeout: 991,
    };

    const newState = { rtrFlsTimeout: 997 };

    const o = okapiReducer(state, { type: OKAPI_REDUCER_ACTIONS.SET_RTR_FLS_TIMEOUT, rtrFlsTimeout: newState.rtrFlsTimeout });
    expect(o).toMatchObject(newState);

    expect(ct).toHaveBeenCalledWith(state.rtrFlsTimeout);
  });

  it('CLEAR_RTR_FLS_TIMEOUT', () => {
    const ct = jest.spyOn(window, 'clearTimeout');

    const state = {
      rtrFlsTimeout: 991,
    };

    const o = okapiReducer(state, { type: OKAPI_REDUCER_ACTIONS.CLEAR_RTR_FLS_TIMEOUT });
    expect(o).toMatchObject({});
    expect(ct).toHaveBeenCalledWith(state.rtrFlsTimeout);
  });
});
