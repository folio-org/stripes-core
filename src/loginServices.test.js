import {
  supportedLocales,
  supportedNumberingSystems,
  updateUser,
} from './loginServices';

import {
  setCurrentServicePoint,
  setUserServicePoints,
  updateCurrentUser,
} from './okapiActions';

jest.mock('localforage', () => ({
  getItem: jest.fn(() => Promise.resolve({ user: {} })),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

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
