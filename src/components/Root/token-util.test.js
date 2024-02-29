import { RTRError, UnexpectedResourceError } from './Errors';
import {
  isFolioApiRequest,
  isLogoutRequest,
  isValidAT,
  isValidRT,
  resourceMapper,
  rtr,
  shouldRotate,
  RTR_IS_ROTATING,
  RTR_MAX_AGE,
} from './token-util';
import { RTR_SUCCESS_EVENT } from './Events';

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
  it('rotates', async () => {
    const context = {
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

    let res = null;
    let ex = null;
    try {
      res = await rtr(context);
    } catch (e) {
      ex = e;
    }

    expect(res.tokenExpiration).toBeTruthy();
    expect(ex).toBe(null);
  });

  describe('handles simultaneous rotation', () => {
    beforeEach(() => {
      localStorage.setItem(RTR_IS_ROTATING, Date.now());
    });
    afterEach(() => {
      localStorage.removeItem(RTR_IS_ROTATING);
    });

    it('same window (RTR_SUCCESS_EVENT)', async () => {
      const context = {
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

      setTimeout(() => {
        window.dispatchEvent(new Event(RTR_SUCCESS_EVENT));
      }, 500);

      setTimeout(() => {
        localStorage.removeItem(RTR_IS_ROTATING);
        window.dispatchEvent(new Event(RTR_SUCCESS_EVENT));
      }, 1000);

      let ex = null;
      try {
        await rtr(context);
      } catch (e) {
        ex = e;
      }

      expect(ex).toBe(null);
      // expect(window.removeEventListener).toHaveBeenCalled();
    });

    it('multiple window (storage event)', async () => {
      const context = {
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

      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 500);

      setTimeout(() => {
        localStorage.removeItem(RTR_IS_ROTATING);
        window.dispatchEvent(new Event('storage'));
      }, 1000);

      let ex = null;
      try {
        await rtr(context);
      } catch (e) {
        ex = e;
      }

      expect(ex).toBe(null);
      // expect(window.removeEventListener).toHaveBeenCalledWith('monkey')
    });
  });



  it('on known error, throws error', async () => {
    const errors = [{ message: 'Actually I love my Birkenstocks', code: 'Chacos are nice, too. Also Tevas' }];
    const context = {
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
    try {
      await rtr(context);
    } catch (e) {
      ex = e;
    }

    expect(ex instanceof RTRError).toBe(true);
    expect(ex.message).toMatch(errors[0].message);
    expect(ex.message).toMatch(errors[0].code);
  });


  it('on unknown error, throws generic error', async () => {
    const error = 'I love my Birkenstocks. Chacos are nice, too. Also Tevas';
    const context = {
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
    try {
      await rtr(context);
    } catch (e) {
      ex = e;
    }

    expect(ex instanceof RTRError).toBe(true);
    expect(ex.message).toMatch('RTR response failure');
  });
});

describe('shouldRotate', () => {
  afterEach(() => {
    localStorage.removeItem(RTR_IS_ROTATING);
  });

  const logger = {
    log: jest.fn(),
  };

  it('returns true if key is absent', () => {
    localStorage.removeItem(RTR_IS_ROTATING);
    expect(shouldRotate(logger)).toBe(true);
  });

  it('returns true if key is expired', () => {
    localStorage.setItem(RTR_IS_ROTATING, Date.now() - (RTR_MAX_AGE + 1000));
    expect(shouldRotate(logger)).toBe(true);
  });

  it('returns false if key is active', () => {
    localStorage.setItem(RTR_IS_ROTATING, Date.now() - 1);
    expect(shouldRotate(logger)).toBe(false);
  });
});
