import localforage from 'localforage';

import { UnexpectedResourceError } from './Errors';
import {
  getTokenSess,
  getTokenExpiry,
  setTokenExpiry,
  isFolioApiRequest,
  isLogoutRequest,
  isValidAT,
  isValidRT,
  resourceMapper,
  rtr,
} from './token-util';

describe('isFolioApiRequest', () => {
  it('accepts requests whose origin matches okapi\'s', () => {
    const oUrl = 'https://millicent-sounds-kinda-like-malificent.edu';
    const req = `${oUrl}/that/is/awkward`;
    expect(isFolioApiRequest(req, oUrl)).toBe(true);
  });

  it('rejects requests whose origin does not match okapi\'s', () => {
    const req = 'https://skipper-seriously-skipper.org';
    expect(isFolioApiRequest(req, 'https://anything-but-skipper.edu')).toBe(false);
  });

  it('rejects invalid resource input', () => {
    const req = { 'ken': 'not kenough' };
    expect(isFolioApiRequest(req, 'https://sorry-dude.edu')).toBe(false);
  });
});

describe('isLogoutRequest', () => {
  it('accepts logout endpoints', () => {
    const path = '/authn/logout';

    expect(isLogoutRequest(path, '')).toBe(true);
  });

  it('rejects unknown endpoints', () => {
    const path = '/maybe/oppie/would/have/been/happier/in/malibu';

    expect(isLogoutRequest(path, '')).toBe(false);
  });

  it('rejects invalid input', () => {
    const path = { wat: '/maybe/oppie/would/have/been/happier/in/malibu' };
    expect(isLogoutRequest(path, '')).toBe(false);
  });
});

describe('isValidAT', () => {
  it('returns true for valid ATs', () => {
    const logger = { log: jest.fn() };
    expect(isValidAT({ atExpires: Date.now() + 1000 }, logger)).toBe(true);
    expect(logger.log).toHaveBeenCalled();
  });

  it('returns false for expired ATs', () => {
    const logger = { log: jest.fn() };
    expect(isValidAT({ atExpires: Date.now() - 1000 }, logger)).toBe(false);
    expect(logger.log).toHaveBeenCalled();
  });

  it('returns false when AT info is missing', () => {
    const logger = { log: jest.fn() };
    expect(isValidAT({ monkey: 'bagel' }, logger)).toBe(false);
    expect(logger.log).toHaveBeenCalled();
  });
});

describe('isValidRT', () => {
  it('returns true for valid RTs', () => {
    const logger = { log: jest.fn() };
    expect(isValidRT({ rtExpires: Date.now() + 1000 }, logger)).toBe(true);
    expect(logger.log).toHaveBeenCalled();
  });

  it('returns false for expired RTs', () => {
    const logger = { log: jest.fn() };
    expect(isValidRT({ rtExpires: Date.now() - 1000 }, logger)).toBe(false);
    expect(logger.log).toHaveBeenCalled();
  });

  it('returns false when RT info is missing', () => {
    const logger = { log: jest.fn() };
    expect(isValidRT({ monkey: 'bagel' }, logger)).toBe(false);
    expect(logger.log).toHaveBeenCalled();
  });
});

describe('resourceMapper', () => {
  const fx = (input) => (input);

  it('accepts strings', () => {
    const av = 'barbie';
    expect(resourceMapper(av, fx)).toBe(av);
  });

  it('accepts URLs', () => {
    const av = 'https://oppie.com';
    expect(resourceMapper(new URL(av), fx)).toBe(av);
  });

  it('accepts Requests', () => {
    const av = 'https://los-alamos-dreamtopia-castle-was-actually-a-nightmare.com/';
    expect(resourceMapper(new Request(av), fx)).toBe(av);
  });

  it('rejects other argument types', () => {
    const av = { ken: 'kenough' };
    try {
      resourceMapper(av, fx);
    } catch (e) {
      expect(e instanceof UnexpectedResourceError).toBe(true);
    }
  });
});

describe.skip('rtr', () => {
  const context = {
    isRotating: true,
    logger: {
      log: jest.fn(),
    },
    tokenExpiration: {},
  };

  it('on error with JSON, returns it', async () => {
    const oUrl = 'https://trinity.edu';
    const req = { url: `${oUrl}/manhattan` };
    const event = {
      request: {
        clone: () => req,
      }
    };

    const error = { message: 'los', code: 'alamos' };
    window.Response = jest.fn();

    global.fetch = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ errors: [error] })
      }));

    try {
      await rtr(context);
    } catch (e) {
      expect(e.message).toMatch(error.message);
      expect(e.message).toMatch(error.code);
    }
  });

  it('on unknown error, throws a generic error', async () => {
    const oUrl = 'https://trinity.edu';
    const req = { url: `${oUrl}/manhattan` };
    const event = {
      request: {
        clone: () => req,
      }
    };

    const error = 'RTR response failure';
    window.Response = jest.fn();

    global.fetch = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        ok: false,
        json: () => Promise.resolve(error)
      }));

    try {
      await rtr(context);
    } catch (e) {
      expect(e.message).toMatch(error);
    }
  });
});

describe('localforage session wrapper', () => {
  it('getTokenSess retrieves a session object', async () => {
    const o = { user: {} };
    localforage.getItem = jest.fn(() => Promise.resolve(o));

    const s = await getTokenSess();
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
