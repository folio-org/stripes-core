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
});
