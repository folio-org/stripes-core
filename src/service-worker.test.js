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

// let consoleInterruptor = null;

// beforeAll(() => {
//   // reassign console.log to keep things quiet
//   consoleInterruptor = console.log;
//   console.log = () => { };
// });

// afterAll(() => {
//   // restore console.log
//   console.log = consoleInterruptor;
// });

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


// /**
//  * rtr
//  * exchange an RT for a new one.
//  * Make a POST request to /authn/refresh, including the current credentials,
//  * and send a TOKEN_EXPIRATION event to clients that includes the new AT/RT
//  * expiration timestamps.
//  * @param {Event} event
//  * @returns Promise
//  * @throws if RTR fails
//  */
// const rtr = async (event) => {
//   console.log('-- (rtr-sw) ** RTR ...');

//   // if several fetches trigger rtr in a short window, all but the first will
//   // fail because the RT will be stale after the first request rotates it.
//   // the sentinel isRotating indicates that rtr has already started and therefore
//   // should not start again; instead, we just need to wait until it finishes.
//   // waiting happens in a for-loop that waits a few milliseconds and then rechecks
//   // isRotating. hopefully, that process goes smoothly, but we'll give up after
//   // IS_ROTATING_RETRIES * IS_ROTATING_INTERVAL milliseconds and return failure.
//   if (isRotating) {
//     for (let i = 0; i < IS_ROTATING_RETRIES; i++) {
//       console.log(`-- (rtr-sw) **    is rotating; waiting ${IS_ROTATING_INTERVAL}ms`);
//       await new Promise(resolve => setTimeout(resolve, IS_ROTATING_INTERVAL));
//       if (!isRotating) {
//         return Promise.resolve();
//       }
//     }
//     // all is lost
//     return Promise.reject(new Error('in-process RTR timed out'));
//   }

//   isRotating = true;
//   return fetch(`${okapiUrl}/authn/refresh`, {
//     headers: {
//       'content-type': 'application/json',
//       'x-okapi-tenant': okapiTenant,
//     },
//     method: 'POST',
//     credentials: 'include',
//     mode: 'cors',
//   })
//     .then(res => {
//       if (res.ok) {
//         return res.json();
//       }

//       // rtr failure. return an error message if we got one.
//       return res.json()
//         .then(json => {
//           isRotating = false;

//           if (json.errors[0]) {
//             throw new Error(`${json.errors[0].message} (${json.errors[0].code})`);
//           } else {
//             throw new Error('RTR response failure');
//           }
//         });
//     })
//     .then(json => {
//       console.log('-- (rtr-sw) **     success!');
//       isRotating = false;
//       tokenExpiration = {
//         atExpires: new Date(json.accessTokenExpiration).getTime(),
//         rtExpires: new Date(json.refreshTokenExpiration).getTime(),
//       };
//       messageToClient(event, { type: 'TOKEN_EXPIRATION', tokenExpiration });
//     });
// };


describe('isPermissibleRequest', () => {
  it('accepts endpoints when AT is valid', () => {
    const req = { url: 'monkey' };
    const te = { atExpires: Date.now() + 1000, rtExpires: Date.now() + 1000 };
    expect(isPermissibleRequest(req, te, '')).toBe(true);
  });

  describe('accepts endpoints that do not require authorization', () => {
    it('/authn/refresh', () => {
      const req = { url: '/authn/refresh' };
      const te = {};

      expect(isPermissibleRequest(req, te, '')).toBe(true);
    });

    it('/bl-users/_self', () => {
      const req = { url: '/bl-users/_self' };
      const te = {};

      expect(isPermissibleRequest(req, te, '')).toBe(true);
    });

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

// /**
//  * isLogoutRequest
//  * Logout requests are always permissible but need special handling
//  * because they should never fail.
//  *
//  * @param {Request} req clone of the original event.request object
//  * @returns boolean true if the request URL matches a logout URL
//  */
// const isLogoutRequest = (req) => {
//   const permissible = [
//     '/authn/logout',
//   ];

//   // console.log(`-- (rtr-sw) logout request ${req.url}`);
//   return !!permissible.find(i => req.url.startsWith(`${okapiUrl}${i}`));
// };
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


// /**
//  * passThroughWithRT
//  * Perform RTR then return the original fetch. on error, post an RTR_ERROR
//  * message to clients and return an empty response in a resolving promise.
//  *
//  * @param {Event} event
//  * @returns Promise
//  */
// const passThroughWithRT = (event) => {
//   const req = event.request.clone();
//   return rtr(event)
//     .then(() => {
//       console.log('-- (rtr-sw) => post-rtr-fetch', req.url);
//       return fetch(event.request, { credentials: 'include' });
//     })
//     .catch((rtre) => {
//       // kill me softly: send an empty response body, which allows the fetch
//       // to return without error while the clients catch up, read the RTR_ERROR
//       // and handle it, hopefully by logging out.
//       // Promise.reject() here would result in every single fetch in every
//       // single application needing to thoughtfully handle RTR_ERROR responses.
//       messageToClient(event, { type: 'RTR_ERROR', error: rtre });
//       return Promise.resolve(new Response({}));
//     });
// };

// /**
//  * passThroughWithAT
//  * Given we believe the AT to be valid, pass the fetch through.
//  * If it fails, maybe our beliefs were wrong, maybe everything is wrong,
//  * maybe there is no God, or there are many gods, or god is a she, or
//  * she is a he, or Lou Reed is god. Or maybe we were just wrong about the
//  * AT and we need to conduct token rotation, so try that. If RTR succeeds,
//  * yay, pass through the fetch as we originally intended because now we
//  * know the AT will be valid. If RTR fails, then it doesn't matter about
//  * Lou Reed. He may be god. We're still throwing an Error.
//  * @param {Event} event
//  * @returns Promise
//  * @throws if any fetch fails
//  */
// const passThroughWithAT = (event) => {
//   console.log('-- (rtr-sw)    (valid AT or authn request)');
//   return fetch(event.request, { credentials: 'include' })
//     .then(response => {
//       if (response.ok) {
//         return response;
//       } else {
//         // we thought the AT was valid but it wasn't, so try again.
//         // if we fail this time, we're done.
//         console.log('-- (rtr-sw)    (whoops, invalid AT; retrying)');
//         return passThroughWithRT(event);
//       }
//     });
// };

// /**
//  * passThroughLogout
//  * The logout request should never fail, even if it fails.
//  * That is, if it fails, we just pretend like it never happened
//  * instead of blowing up and causing somebody to get stuck in the
//  * logout process.
//  * @param {Event} event
//  * @returns Promise
//  */
// const passThroughLogout = (event) => {
//   console.log('-- (rtr-sw)    (logout request)');
//   return fetch(event.request, { credentials: 'include' })
//     .catch(e => {
//       console.error('-- (rtr-sw) logout failure', e); // eslint-disable-line no-console
//       return Promise.resolve();
//     });
// };

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
      const tokenExpiration = { }
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
      const tokenExpiration = { }
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

    it('requests with valid ATs succeed', async () => {
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
        .mockReturnValueOnce(Promise.resolve({ ok: false }))
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
          json: () => Promise.reject('RTR response failure')
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

