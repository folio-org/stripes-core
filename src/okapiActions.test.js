import {
  setIsAuthenticated,
  setLoginData,
  updateCurrentUser,
} from './okapiActions';

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
