import okapiReducer from './okapiReducer';

describe('okapiReducer', () => {
  it('SET_LOGIN_DATA', () => {
    const loginData = 'loginData';
    const o = okapiReducer({}, { type: 'SET_LOGIN_DATA', loginData });
    expect(o).toMatchObject({ loginData });
  });

  it('UPDATE_CURRENT_USER', () => {
    const initialState = { funky: 'chicken' };
    const data = { monkey: 'bagel' };
    const o = okapiReducer(initialState, { type: 'UPDATE_CURRENT_USER', data });
    expect(o).toMatchObject({ ...initialState, currentUser: { ...data } });
  });

  it('SET_SESSION_DATA', () => {
    const initialState = {
      perms: [],
      user: {},
      token: 'qwerty',
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
      token: 'ytrewq',
      tenant: 'institutional',
    };
    const o = okapiReducer(initialState, { type: 'SET_SESSION_DATA', session });
    const { user, perms, ...rest } = session;
    expect(o).toMatchObject({
      ...initialState,
      ...rest,
      currentUser: user,
      currentPerms: perms,
    });
  });
});
