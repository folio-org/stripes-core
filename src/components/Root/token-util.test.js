import localforage from 'localforage';

import { RTRError, UnexpectedResourceError } from './Errors';
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
  IS_ROTATING_INTERVAL,
  IS_ROTATING_RETRIES
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

describe('rtr', () => {
  it('isRotating: resolves when rotation completes', async () => {
    const context = {
      isRotating: true,
      logger: {
        log: jest.fn(),
      },
    };

    let ex = null;

    setTimeout(() => {
      context.isRotating = false;
    }, IS_ROTATING_INTERVAL);

    await rtr(context)
      .catch(e => {
        ex = e;
      });

    expect(ex).toBe(null);
  });

  it('rotates', async () => {
    const context = {
      isRotating: false,
      logger: {
        log: jest.fn(),
      },
      nativeFetch: {
        apply: () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessTokenExpiration: '2023-11-17T10:39:15.000Z',
            refreshTokenExpiration: '2023-11-27T10:39:15.000Z'
          }),
        })
      }
    };

    let ex = null;
    const res = await rtr(context)
      .catch(e => {
        ex = e;
      });

    expect(res.tokenExpiration).toBeTruthy();
    expect(ex).toBe(null);
  });

  it('on known error, throws error', async () => {
    const errors = [{ message: 'Actually I love my Birkenstocks', code: 'Chacos are nice, too. Also Tevas' }];
    const context = {
      isRotating: false,
      logger: {
        log: jest.fn(),
      },
      nativeFetch: {
        apply: () => Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            errors,
          }),
        })
      }
    };

    let ex = null;
    await rtr(context)
      .catch(e => {
        ex = e;
      });

    expect(ex instanceof RTRError).toBe(true);
    expect(ex.message).toMatch(errors[0].message);
    expect(ex.message).toMatch(errors[0].code);
  });


  it('on unknown error, throws generic error', async () => {
    const error = 'I love my Birkenstocks. Chacos are nice, too. Also Tevas';
    const context = {
      isRotating: false,
      logger: {
        log: jest.fn(),
      },
      nativeFetch: {
        apply: () => Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error,
          }),
        })
      }
    };

    let ex = null;
    await rtr(context)
      .catch(e => {
        ex = e;
      });

    expect(ex instanceof RTRError).toBe(true);
    expect(ex.message).toMatch('RTR response failure');
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
