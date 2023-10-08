/* eslint no-console: 0 */

/* eslint no-restricted-globals: ["off", "self"] */

/** { atExpires, rtExpires } both are JS millisecond timestamps */
let tokenExpiration = null;

/** string FQDN including protocol, e.g. https://some-okapi.somewhere.org */
let okapiUrl = null;

/** categorical logger object */
let logger = null;

/** lock to indicate whether a rotation request is already in progress */
let isRotating = false;
/** how many times to check the lock before giving up */
const IS_ROTATING_RETRIES = 100;
/** how long to wait before rechecking the lock, in milliseconds (100 * 100) === 10 seconds */
const IS_ROTATING_INTERVAL = 100;

/** log all event */
const log = (message, ...rest) => {
  console.log(`-- (rtr-sw) -- (rtr-sw) ${message}`, rest);
  // console.log('-- (rtr-sw) wtf is my logger?', logger)
  // console.log(typeof logger?.log)
  //
  // if (logger) {
  //   logger.log('-- (rtr-sw) rtr-sw', message);
  // }
};

/**
 * isValidAT
 * return true if tokenExpiration.atExpires is in the future
 * @returns boolean
 */
const isValidAT = () => {
  console.log(`-- (rtr-sw) => at expires ${new Date(tokenExpiration?.atExpires || null).toISOString()}`);
  return !!(tokenExpiration?.atExpires > Date.now());
};

/**
 * isValidRT
 * return true if tokenExpiration.rtExpires is in the future
 * @returns boolean
 */
const isValidRT = () => {
  console.log(`-- (rtr-sw) => rt expires ${new Date(tokenExpiration?.rtExpires || null).toISOString()}`);
  return !!(tokenExpiration?.rtExpires > Date.now());
};

/**
 * messageToClient
 * Send a message to clients of this service worker
 * @param {Event} event
 * @param {*} message
 * @returns void
 */
const messageToClient = async (event, message) => {
  // Exit early if we don't have access to the client.
  // Eg, if it's cross-origin.
  if (!event.clientId) {
    console.log('-- (rtr-sw) PASSTHROUGH: no clientId');
    return;
  }

  // Get the client.
  const client = await self.clients.get(event.clientId);
  // Exit early if we don't get the client.
  // Eg, if it closed.
  if (!client) {
    console.log('-- (rtr-sw) PASSTHROUGH: no client');
    return;
  }

  // Send a message to the client.
  console.log('-- (rtr-sw) => sending', message);
  client.postMessage({ ...message, source: '@folio/stripes-core' });
};

/**
 * rtr
 * exchange an RT for a new one.
 * Make a POST request to /authn/refresh, including the current credentials,
 * and send a TOKEN_EXPIRATION event to clients that includes the new AT/RT
 * expiration timestamps.
 * @param {Event} event
 * @returns Promise
 * @throws if RTR fails
 */
const rtr = async (event) => {
  console.log('-- (rtr-sw) ** RTR ...');

  // if several fetches trigger rtr in a short window, all but the first will
  // fail because the RT will be stale after the first request rotates it.
  // the sentinel isRotating indicates that rtr has already started and therefore
  // should not start again; instead, we just need to wait until it finishes.
  // waiting happens in a for-loop that waits a few milliseconds and then rechecks
  // isRotating. hopefully, that process goes smoothly, but we'll give up after
  // IS_ROTATING_RETRIES * IS_ROTATING_INTERVAL milliseconds and return failure.
  if (isRotating) {
    for (let i = 0; i < IS_ROTATING_RETRIES; i++) {
      console.log(`-- (rtr-sw) **    is rotating; waiting ${IS_ROTATING_INTERVAL}ms`);
      await new Promise(resolve => setTimeout(resolve, IS_ROTATING_INTERVAL));
      if (!isRotating) {
        return Promise.resolve();
      }
    }
    // all is lost
    return Promise.reject(new Error('in-process RTR timed out'));
  }

  isRotating = true;
  return fetch(`${okapiUrl}/authn/refresh`, {
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
  })
    .then(res => {
      if (res.ok) {
        return res.json();
      }

      console.error('----> rtr failure')

      // rtr failure. return an error message if we got one.
      return res.json()
        .then(json => {
          isRotating = false;

          if (json.errors[0]) {
            throw new Error(`${json.errors[0].message} (${json.errors[0].code})`);
          } else {
            throw new Error('RTR response failure');
          }
        });
    })
    .then(json => {
      console.log('-- (rtr-sw) **     success!');
      isRotating = false;
      tokenExpiration = {
        atExpires: new Date(json.accessTokenExpiration).getTime(),
        rtExpires: new Date(json.refreshTokenExpiration).getTime(),
      };
      messageToClient(event, { type: 'TOKEN_EXPIRATION', tokenExpiration });
    });
};

/**
 * isPermissibleRequest
 * Some requests are always permissible, e.g. auth-n and token-rotation.
 * Others are only permissible if the Access Token is still valid.
 *
 * @param {Request} req clone of the original event.request object
 * @returns boolean true if the AT is valid or the request is always permissible
 */
const isPermissibleRequest = (req) => {
  if (isValidAT()) {
    return true;
  }

  const permissible = [
    '/authn/refresh',
    '/bl-users/_self',
    '/bl-users/login-with-expiry',
    '/saml/check',
  ];

  // console.log(`-- (rtr-sw) AT invalid for ${req.url}`);
  return !!permissible.find(i => req.url.startsWith(`${okapiUrl}${i}`));
};

/**
 * isLogoutRequest
 * Logout requests are always permissible but need special handling
 * because they should never fail.
 *
 * @param {Request} req clone of the original event.request object
 * @returns boolean true if the request URL matches a logout URL
 */
const isLogoutRequest = (req) => {
  const permissible = [
    '/authn/logout',
  ];

  // console.log(`-- (rtr-sw) logout request ${req.url}`);
  return !!permissible.find(i => req.url.startsWith(`${okapiUrl}${i}`));
};

/**
 * isOkapiRequest
 * Return true if the request origin matches our okapi URL, i.e. if this is a
 * request that needs to include a valid AT.
 * @param {Request} req
 * @returns boolean
 */
const isOkapiRequest = (req) => {
  // console.log(`-- (rtr-sw) isOkapiRequest: ${new URL(req.url).origin} === ${okapiUrl}`);
  return new URL(req.url).origin === okapiUrl;
};

/**
 * passThroughWithRT
 * Perform RTR then return the original fetch.
 *
 * @param {Event} event
 * @returns Promise
 */
const passThroughWithRT = (event) => {
  const req = event.request.clone();
  return rtr(event)
    .then(() => {
      console.log('-- (rtr-sw) => post-rtr-fetch', req.url);
      return fetch(event.request, { credentials: 'include' });
    })
    .catch((rtre) => {
      messageToClient(event, { type: 'RTR_ERROR', error: rtre });
      // return Promise.resolve('kill me, kill me softly');
      return Promise.reject(new Error(rtre));
    });
};

/**
 * passThroughWithAT
 * Given we believe the AT to be valid, pass the fetch through.
 * If it fails, maybe our beliefs were wrong, maybe everything is wrong,
 * maybe there is no God, or there are many gods, or god is a she, or
 * she is a he, or Lou Reed is god. Or maybe we were just wrong about the
 * AT and we need to conduct token rotation, so try that. If RTR succeeds,
 * yay, pass through the fetch as we originally intended because now we
 * know the AT will be valid. If RTR fails, then it doesn't matter about
 * Lou Reed. He may be god. We're still throwing an Error.
 * @param {Event} event
 * @returns Promise
 * @throws if any fetch fails
 */
const passThroughWithAT = (event) => {
  console.log('-- (rtr-sw)    (valid AT or authn request)');
  return fetch(event.request, { credentials: 'include' })
    .then(response => {
      if (response.ok) {
        return response;
      } else {
        // we thought the AT was valid but it wasn't, so try again.
        // if we fail this time, we're done.
        console.log('-- (rtr-sw)    (whoops, invalid AT; retrying)');
        return passThroughWithRT(event);
      }
    });
};

/**
 * passThroughLogout
 * The logout request should never fail, even if it fails.
 * That is, if it fails, we just pretend like it never happened
 * instead of blowing up and causing somebody to get stuck in the
 * logout process.
 * @param {Event} event
 * @returns Promise
 */
const passThroughLogout = (event) => {
  console.log('-- (rtr-sw)    (logout request)');
  return fetch(event.request, { credentials: 'include' })
    .catch(e => {
      console.error('-- (rtr-sw) logout failure', e); // eslint-disable-line no-console
      return Promise.resolve();
    });
};

/**
 * passThrough
 * Inspect event.request to determine whether it's an okapi request.
 * If it is, make sure its AT is valid or perform RTR before executing it.
 * If it isn't, execute it immediately.
 * @param {Event} event
 * @returns Promise
 * @throws if any fetch fails
 */
const passThrough = (event) => {
  const req = event.request.clone();

  // okapi requests are subject to RTR
  if (isOkapiRequest(req)) {
    console.log('-- (rtr-sw) => will fetch', req.url);
    if (isLogoutRequest(req)) {
      return passThroughLogout(event);
    }

    if (isPermissibleRequest(req)) {
      return passThroughWithAT(event);
    }

    if (isValidRT()) {
      console.log('-- (rtr-sw) =>      valid RT');
      return passThroughWithRT(event);
    }

    // kill me softly, letting the top-level handler pick up the failure
    messageToClient(event, { type: 'RTR_ERROR', error: 'AT/RT failure' });
    // return Promise.resolve('actually this did not resolve but we want to die softly')
    return Promise.reject(new Error(`Invalid RT; could not fetch ${req.url}`));
  }

  // default: pass requests through to the network
  // console.log('-- (rtr-sw) passThrough NON-OKAPI', req.url)
  return fetch(event.request, { credentials: 'include' })
    .catch(e => {
      console.error(e); // eslint-disable-line no-console
      return Promise.reject(new Error(e));
    });
};

/**
 * install
 * on install, force this SW to be the active SW
 */
self.addEventListener('install', (event) => {
  console.log('-- (rtr-sw) => install', event);
  return self.skipWaiting();
});

/**
 * activate
 * on activate, force this SW to control all in-scope clients,
 * even those that loaded before this SW was registered.
 */
self.addEventListener('activate', async (event) => {
  console.log('-- (rtr-sw) => activate', event);
  event.waitUntil(self.clients.claim());
});

// self.addEventListener('activate', async (event) => {
//   console.info('=> activate', event);
//   clients.claim();
//   // event.waitUntil(clients.claim());
// });

/**
 * eventListener: message
 * listen for messages from clients and dispatch them accordingly.
 * OKAPI_URL: store
 */
self.addEventListener('message', async (event) => {
  if (event.data.source === '@folio/stripes-core') {
    console.info('-- (rtr-sw) reading', event.data);
    if (event.data.type === 'OKAPI_URL') {
      okapiUrl = event.data.value;
    }

    if (event.data.type === 'LOGGER') {
      logger = event.data.value;
    }

    if (event.data.type === 'TOKEN_EXPIRATION') {
      tokenExpiration = event.data.tokenExpiration;
    }
  }
});

/**
 * eventListener: fetch
 * intercept fetches
 */
self.addEventListener('fetch', async (event) => {
  // const clone = event.request.clone();
  // console.log('-- (rtr-sw) => fetch', clone.url)

  // console.log('-- (rtr-sw) => fetch') // , clone.url)
  event.respondWith(passThrough(event));
});

