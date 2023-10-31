import {
  isLogoutRequest,
  isOkapiRequest,
  isPermissibleRequest,
  isValidAT,
  isValidRT,
  messageToClient,
  passThrough,
  passThroughLogout,
  rtr,
} from './service-worker';

// reassign console.log to keep things quiet
const consoleInterruptor = {};
beforeAll(() => {
  consoleInterruptor.log = global.console.log;
  consoleInterruptor.error = global.console.error;
  console.log = () => { };
  console.error = () => { };
});

afterAll(() => {
  global.console.log = consoleInterruptor.log;
  global.console.error = consoleInterruptor.error;
});

describe('isValidAT', () => {
  it('returns true for valid ATs', () => {
    expect(isValidAT({ atExpires: Date.now() + 1000 })).toBe(true);
  });

  it('returns false for expired ATs', () => {
    expect(isValidAT({ atExpires: Date.now() - 1000 })).toBe(false);
  });

  it('returns false when AT info is missing', () => {
    expect(isValidAT({ monkey: 'bagel' })).toBe(false);
  });
});

describe('isValidRT', () => {
  it('returns true for valid ATs', () => {
    expect(isValidRT({ rtExpires: Date.now() + 1000 })).toBe(true);
  });

  it('returns false for expired RTs', () => {
    expect(isValidRT({ rtExpires: Date.now() - 1000 })).toBe(false);
  });

  it('returns false when RT info is missing', () => {
    expect(isValidRT({ monkey: 'bagel' })).toBe(false);
  });
});

describe('messageToClient', () => {
  let self = null;
  const client = {
    postMessage: jest.fn(),
  };

  describe('when clients are absent, ignores events', () => {
    beforeEach(() => {
      ({ self } = window);
      delete window.self;

      window.self = {
        clients: {
          get: jest.fn().mockReturnValue(Promise.resolve(undefined)),
        },
      };
    });

    afterEach(() => {
      window.self = self;
    });

    it('event.clientId is absent', async () => {
      messageToClient({});
      expect(window.self.clients.get).not.toHaveBeenCalled();
    });

    it('self.clients.get(event.clientId) is empty', async () => {
      const event = { clientId: 'monkey' };
      messageToClient(event, 'message');
      expect(window.self.clients.get).toHaveBeenCalledWith(event.clientId);
      expect(client.postMessage).not.toHaveBeenCalled();
    });
  });

  describe('when clients are present, posts a message', () => {
    beforeEach(() => {
      ({ self } = window);
      delete window.self;

      window.self = {
        clients: {
          get: jest.fn().mockReturnValue(Promise.resolve(client)),
        },
      };
    });

    afterEach(() => {
      window.self = self;
    });

    it('posts a message', async () => {
      const event = { clientId: 'monkey' };
      const message = { thunder: 'chicken' };

      await messageToClient(event, message);
      expect(window.self.clients.get).toHaveBeenCalledWith(event.clientId);
      expect(client.postMessage).toBeCalledWith({ ...message, source: '@folio/stripes-core' });
    });
  });
});

describe('isPermissibleRequest', () => {
  describe('when AT is valid', () => {
    it('when AT is valid, accepts any endpoint', () => {
      const req = { url: 'monkey' };
      const te = { atExpires: Date.now() + 1000, rtExpires: Date.now() + 1000 };
      expect(isPermissibleRequest(req, te, '')).toBe(true);
    });
  });

  describe('when AT is invalid or missing', () => {
    describe('accepts known endpoints that do not require authorization', () => {
      it('/bl-users/forgotten/password', () => {
        const req = { url: '/bl-users/forgotten/password' };
        const te = {};

        expect(isPermissibleRequest(req, te, '')).toBe(true);
      });

      it('/bl-users/forgotten/username', () => {
        const req = { url: '/bl-users/forgotten/username' };
        const te = {};

        expect(isPermissibleRequest(req, te, '')).toBe(true);
      });

      it('/bl-users/login-with-expiry', () => {
        const req = { url: '/bl-users/login-with-expiry' };
        const te = {};

        expect(isPermissibleRequest(req, te, '')).toBe(true);
      });

      it('/bl-users/password-reset', () => {
        const req = { url: '/bl-users/password-reset' };
        const te = {};

        expect(isPermissibleRequest(req, te, '')).toBe(true);
      });

      it('/saml/check', () => {
        const req = { url: '/saml/check' };
        const te = {};

        expect(isPermissibleRequest(req, te, '')).toBe(true);
      });
    });

    it('rejects unknown endpoints', () => {
      const req = { url: '/monkey/bagel/is/not/known/to/stripes/at/least/i/hope/not' };
      const te = {};

      expect(isPermissibleRequest(req, te, '')).toBe(false);
    });
  });
});

describe('isLogoutRequest', () => {
  describe('accepts logout endpoints', () => {
    it('/authn/logout', () => {
      const req = { url: '/authn/logout' };

      expect(isLogoutRequest(req, '')).toBe(true);
    });
  });

  it('rejects unknown endpoints', () => {
    const req = { url: '/monkey/bagel/is/not/known/to/stripes/at/least/i/hope/not' };
    const te = {};

    expect(isLogoutRequest(req, te, '')).toBe(false);
  });
});

describe('isOkapiRequest', () => {
  it('accepts requests whose origin matches okapi\'s', () => {
    const oUrl = 'https://domain.edu';
    const req = { url: `${oUrl}/some/endpoint` };
    expect(isOkapiRequest(req, oUrl)).toBe(true);
  });

  it('rejects requests whose origin does not match okapi\'s', () => {
    const req = { url: 'https://foo.edu/some/endpoint' };
    expect(isOkapiRequest(req, 'https://bar.edu')).toBe(false);
  });
});

describe('passThroughLogout', () => {
  it('succeeds', async () => {
    const val = { monkey: 'bagel' };
    global.fetch = jest.fn(() => (
      Promise.resolve({
        json: () => Promise.resolve(val),
      })
    ));
    const event = { request: 'monkey' };
    const res = await passThroughLogout(event);
    expect(await res.json()).toMatchObject(val);
  });

  it('succeeds even when it fails', async () => {
    window.Response = jest.fn();
    const val = {};
    global.fetch = jest.fn(() => Promise.reject(Promise.resolve(new Response({}))));

    const event = { request: 'monkey' };
    const res = await passThroughLogout(event);
    expect(await res).toMatchObject(val);
  });
});

describe('passThrough', () => {
  describe('non-okapi requests break on through, break on through, break on through to the other side', () => {
    it('successful requests receive a response', async () => {
      const req = {
        url: 'https://barbie-is-the-greatest-action-movie-of-all-time.fight.me'
      };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {};
      const oUrl = 'https://okapi.edu';

      const response = 'kenough';
      global.fetch = jest.fn(() => Promise.resolve(response));

      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toBe(response);
    });

    it('failed requests receive a rejection', async () => {
      const req = {
        url: 'https://barbie-is-the-greatest-action-movie-of-all-time.fight.me'
      };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {};
      const oUrl = 'https://okapi.edu';

      const error = 'not kenough';
      global.fetch = jest.fn(() => Promise.reject(error));

      try {
        await passThrough(event, tokenExpiration, oUrl);
      } catch (e) {
        expect(e).toMatchObject(new Error(error));
      }
    });
  });

  describe('okapi requests are subject to RTR', () => {
    it('requests to logout succeed', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/authn/logout` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {};

      const response = 'oppenheimer';
      global.fetch = jest.fn(() => Promise.resolve(response));

      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toEqual(response);
    });

    // request was valid, response is success; we should receive response
    it('requests with valid ATs succeed with success response', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = { atExpires: Date.now() + 10000 };

      const response = { ok: true };
      global.fetch = jest.fn(() => Promise.resolve(response));

      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toEqual(response);
    });

    // request was valid, response is error; we should receive response
    it('requests with valid ATs succeed with error response', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = { atExpires: Date.now() + 10000 };

      const response = {
        ok: false,
        status: 403,
        headers: { 'content-type': 'text/plain' },
        clone: () => ({
          text: () => Promise.resolve('Access for user \'barbie\' (c0ffeeee-dead-beef-dead-coffeecoffee) requires permission: pink.is.the.new.black')
        }),
      };
      global.fetch = jest.fn(() => Promise.resolve(response));

      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toEqual(response);
    });

    it('requests with false-valid AT data succeed via RTR', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {
        atExpires: Date.now() + 1000, // at says it's valid, but ok == false
        rtExpires: Date.now() + 1000
      };

      const response = 'los alamos';
      global.fetch = jest.fn()
        .mockReturnValueOnce(Promise.resolve({
          status: 403,
          headers: { 'content-type': 'text/plain' },
          clone: () => ({
            text: () => Promise.resolve('Token missing, access requires permission:'),
          }),
        }))
        .mockReturnValueOnce(Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessTokenExpiration: Date.now(),
            refreshTokenExpiration: Date.now(),
          })
        }))
        .mockReturnValueOnce(Promise.resolve(response));
      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toEqual(response);
    });

    it('requests with valid RTs succeed', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {
        atExpires: Date.now() - 1000,
        rtExpires: Date.now() + 1000
      };

      const response = 'los alamos';

      global.fetch = jest.fn()
        .mockReturnValueOnce(Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            accessTokenExpiration: Date.now(),
            refreshTokenExpiration: Date.now(),
          })
        }))
        .mockReturnValueOnce(Promise.resolve(response));
      const res = await passThrough(event, tokenExpiration, oUrl);
      expect(res).toEqual(response);
    });

    it('requests with false-valid RTs fail softly', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {
        atExpires: Date.now() - 1000,
        rtExpires: Date.now() + 1000 // rt says it's valid but ok == false
      };

      const error = {};
      window.Response = jest.fn();

      global.fetch = jest.fn()
        .mockReturnValueOnce(Promise.resolve({
          ok: false,
          json: () => Promise.resolve('RTR response failure')
        }))
        .mockReturnValueOnce(Promise.resolve(error));

      try {
        await passThrough(event, tokenExpiration, oUrl);
      } catch (e) {
        expect(e).toMatchObject(error);
      }
    });

    it('requests with invalid RTs fail softly', async () => {
      const oUrl = 'https://trinity.edu';
      const req = { url: `${oUrl}/manhattan` };
      const event = {
        request: {
          clone: () => req,
        }
      };
      const tokenExpiration = {
        atExpires: Date.now() - 1000,
        rtExpires: Date.now() - 1000
      };

      const error = {};
      window.Response = jest.fn();

      global.fetch = jest.fn()
        .mockReturnValueOnce(Promise.resolve({
          ok: false,
          json: () => Promise.reject(new Error('RTR response failure')),
        }))
        .mockReturnValueOnce(Promise.resolve(error));

      try {
        await passThrough(event, tokenExpiration, oUrl);
      } catch (e) {
        expect(e).toMatchObject(error);
      }
    });
  });
});

describe('rtr', () => {
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
      await rtr(event);
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
      await rtr(event);
    } catch (e) {
      expect(e.message).toMatch(error);
    }
  });
});

