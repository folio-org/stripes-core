import {
  setCurServicePoint,
  setServicePoints,
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

describe('setCurServicePoint', () => {
  it('dispatches setCurrentServicePoint', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const sp = 'monkey-bagel';
    await setCurServicePoint(store, sp);
    expect(store.dispatch).toHaveBeenCalledWith(setCurrentServicePoint(sp));
  });
});

describe('setServicePoints', () => {
  it('dispatches setUserServicePoints', async () => {
    const store = {
      dispatch: jest.fn(),
    };
    const data = ['thunder', 'chicken'];
    await setServicePoints(store, data);
    expect(store.dispatch).toHaveBeenCalledWith(setUserServicePoints(data));
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
