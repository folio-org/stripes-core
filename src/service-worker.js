/* eslint no-console: 0 */

/* eslint no-restricted-globals: ["off", "self"] */

/** { atExpires, rtExpires } both are JS millisecond timestamps */
let tokenExpiration = null;

/** string FQDN including protocol, e.g. https://some-okapi.somewhere.org */
let okapiUrl = null;

/** categorical logger object */
let logger = null;

let isRotating = false;

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
  // fail because the RT will be stale once processed during the first request.
  // locking rtr with isRotating prevents multiple requests from firing, and
  //
  if (isRotating) {
    // try for ten seconds then give up
    // for 1 ... 100
    //     if ! isRotating return resolve
    // return reject
    while (isRotating) {
      // console.log('-- (rtr-sw) **    is rotating; waiting 100');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return Promise.resolve();
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
  const permissible = [
    '/authn/logout',
    '/authn/refresh',
    '/bl-users/_self',
    '/bl-users/login-with-expiry',
    '/saml/check',
  ];

  const ret = permissible.find(i => req.url.startsWith(`${okapiUrl}${i}`));
  // console.log(`-- (rtr-sw) ret is ${ret} for ${req.url}`, req.url);
  return (isValidAT() || !!ret);
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
    .catch(e => {
      console.log('-- (rtr-sw)    (whoops, invalid AT; retrying)', e);
      // we thought the AT was valid but it wasn't, so try again.
      // if we fail this time, we're done.
      return rtr(event)
        .then(() => {
          return fetch(event.request, { credentials: 'include' });
        })
        .catch((rtre) => {
          console.error(rtre); // eslint-disable-line no-console
          throw new Error(rtre);
        });
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
const passThrough = async (event) => {
  const req = event.request.clone();

  // okapi requests are subject to RTR
  if (isOkapiRequest(req)) {
    console.log('-- (rtr-sw) => fetch', req.url);
    if (isPermissibleRequest(req)) {
      return passThroughWithAT(event);
    }

    if (isValidRT()) {
      console.log('-- (rtr-sw) =>      valid RT');
      return rtr(event)
        .then(() => {
          return fetch(event.request, { credentials: 'include' });
        })
        .catch(error => {
          messageToClient(event, { type: 'RTR_ERROR', error });
          return Promise.reject(new Error(error));
        });
    }

    messageToClient(event, { type: 'RTR_ERROR', error: 'Invalid RT' });
    return Promise.reject(new Error('Invalid RT'));
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

