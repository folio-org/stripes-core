import { RTRError, UnexpectedResourceError } from './Errors';
import {
  configureRtr,
  getPromise,
  isAuthenticationRequest,
  isFolioApiRequest,
  isLogoutRequest,
  isRotating,
  resourceMapper,
  rtr,
  RTR_IS_ROTATING,
  RTR_MAX_AGE,
} from './token-util';
import { RTR_SUCCESS_EVENT } from './constants';

const okapi = {
  tenant: 'diku',
  url: 'http://test'
};

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


describe('isAuthenticationRequest', () => {
  it('accepts authn endpoints', () => {
    const path = '/bl-users/_self';

    expect(isAuthenticationRequest(path, '')).toBe(true);
  });

  it('rejects unknown endpoints', () => {
    const path = '/maybe/oppie/would/have/been/happier/in/malibu';

    expect(isAuthenticationRequest(path, '')).toBe(false);
  });

  it('rejects invalid input', () => {
    const path = { wat: '/if/you/need/to/go/to/church/is/that/a/critical/mass' };
    expect(isAuthenticationRequest(path, '')).toBe(false);
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
  beforeEach(() => {
    localStorage.removeItem(RTR_IS_ROTATING);
  });

  afterEach(() => {
    localStorage.removeItem(RTR_IS_ROTATING);
  });

  it('rotates', async () => {
    const logger = {
      log: console.log,
    };
    const fetchfx = {
      apply: () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          accessTokenExpiration: '2023-11-17T10:39:15.000Z',
          refreshTokenExpiration: '2023-11-27T10:39:15.000Z'
        }),
      })
    };

    const callback = jest.fn();

    let ex = null;
    // const callback = () => { console.log('HOLA!!!')}; // jest.fn();
    try {
      await rtr(fetchfx, logger, callback, okapi);
      expect(callback).toHaveBeenCalled();
    } catch (e) {
      ex = e;
    }

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
      const logger = {
        log: jest.fn(),
      };
      const nativeFetch = {
        apply: () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessTokenExpiration: '2023-11-17T10:39:15.000Z',
            refreshTokenExpiration: '2023-11-27T10:39:15.000Z'
          }),
        })
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
        await rtr(nativeFetch, logger, jest.fn(), okapi);
      } catch (e) {
        ex = e;
      }

      expect(ex).toBe(null);
      // expect(window.removeEventListener).toHaveBeenCalled();
    });

    it('multiple window (storage event)', async () => {
      const logger = {
        log: jest.fn(),
      };
      const nativeFetch = {
        apply: () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessTokenExpiration: '2023-11-17T10:39:15.000Z',
            refreshTokenExpiration: '2023-11-27T10:39:15.000Z'
          }),
        })
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
        await rtr(nativeFetch, logger, jest.fn(), okapi);
      } catch (e) {
        ex = e;
      }

      expect(ex).toBe(null);
      // expect(window.removeEventListener).toHaveBeenCalledWith('monkey')
    });
  });

  it('on known error, throws error', async () => {
    jest.spyOn(window, 'dispatchEvent');
    jest.spyOn(console, 'error');

    const errors = [{ message: 'Actually I love my Birkenstocks', code: 'Chacos are nice, too. Also Tevas' }];
    const logger = {
      log: jest.fn(),
    };

    const nativeFetch = {
      apply: () => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          errors,
        }),
      })
    };

    let ex = null;
    try {
      await rtr(nativeFetch, logger, jest.fn(), okapi);
    } catch (e) {
      ex = e;
    }

    expect(console.error).toHaveBeenCalledWith('RTR_ERROR_EVENT', expect.any(RTRError));
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    expect(ex).toBe(null);
  });


  it('on unknown error, throws generic error', async () => {
    jest.spyOn(window, 'dispatchEvent');
    jest.spyOn(console, 'error');

    const error = 'I love my Birkenstocks. Chacos are nice, too. Also Tevas';
    const logger = {
      log: jest.fn(),
    };
    const nativeFetch = {
      apply: () => Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error,
        }),
      })
    };

    let ex = null;
    try {
      await rtr(nativeFetch, logger, jest.fn(), okapi);
    } catch (e) {
      ex = e;
    }

    expect(console.error).toHaveBeenCalledWith('RTR_ERROR_EVENT', expect.any(RTRError));
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    expect(ex).toBe(null);
  });
});

describe('isRotating', () => {
  afterEach(() => {
    localStorage.removeItem(RTR_IS_ROTATING);
  });

  const logger = {
    log: jest.fn(),
  };

  it('returns true if key is present and not stale', () => {
    localStorage.setItem(RTR_IS_ROTATING, Date.now());
    expect(isRotating(logger)).toBe(true);
  });

  it('returns false if key is present but expired', () => {
    localStorage.setItem(RTR_IS_ROTATING, Date.now() - (RTR_MAX_AGE + 1000));
    expect(isRotating(logger)).toBe(false);
  });

  it('returns false if key is absent', () => {
    expect(isRotating(logger)).toBe(false);
  });
});

describe('getPromise', () => {
  describe('when isRotating is true', () => {
    beforeEach(() => {
      localStorage.setItem(RTR_IS_ROTATING, Date.now());
    });
    afterEach(() => {
      localStorage.removeItem(RTR_IS_ROTATING);
    });

    it('waits until localStorage\'s RTR_IS_ROTATING flag is cleared', async () => {
      let res = null;
      const logger = { log: jest.fn() };
      const p = getPromise(logger);
      localStorage.removeItem(RTR_IS_ROTATING);
      window.dispatchEvent(new Event(RTR_SUCCESS_EVENT));

      await p.then(() => {
        res = true;
      });
      expect(res).toBeTruthy();
    });
  });

  describe('when isRotating is false', () => {
    beforeEach(() => {
      localStorage.removeItem(RTR_IS_ROTATING);
    });

    it('receives a resolved promise', async () => {
      let res = null;
      await getPromise()
        .then(() => {
          res = true;
        });
      expect(res).toBeTruthy();
    });
  });
});

describe('configureRtr', () => {
  it('sets idleSessionTTL and idleModalTTL', () => {
    const res = configureRtr({});
    expect(res.idleSessionTTL).toBe('60m');
    expect(res.idleModalTTL).toBe('1m');
  });

  it('leaves existing settings in place', () => {
    const res = configureRtr({
      idleSessionTTL: '5m',
      idleModalTTL: '5m',
    });

    expect(res.idleSessionTTL).toBe('5m');
    expect(res.idleModalTTL).toBe('5m');
  });
});
