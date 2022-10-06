import {
  setLoginData,
  updateCurrentUser,
} from './okapiActions';

describe('setLoginData', () => {
  it('receives given data in "loginData"', () => {
    const av = { monkey: 'bagel' };
    expect(setLoginData(av).loginData).toMatchObject(av);
  });
});

describe('updateCurrentUser', () => {
  it('receives given data in "data"', () => {
    const av = { monkey: 'bagel' };
    expect(updateCurrentUser(av).data).toMatchObject(av);
  });
});
