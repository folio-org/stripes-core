/* eslint no-console: 0 */
/* eslint no-restricted-globals: ["off", "self"] */

/**
 * TLDR: perform refresh-token-rotation for Okapi-bound requests.
 *
 * The gory details:
 * This service worker acts as a proxy betwen the browser and the network,
 * intercepting all fetch requests. Those not bound for Okapi are simply
 * passed along; the rest are intercepted in an attempt to make sure the
 * accompanying access-token (provided in an http-only cookie) is valid.
 *
 * The install and activate listeners are configured to cause this worker
 * to activate immediately and begin controlling all clients.
 *
 * The message listener receives config values and changes, such as
 * setting the okapi URL and tenant, as well as resetting the timeouts
 * for the AT and RT, which can be used to force RTR. Only messages with
 * a data.source attribute === @folio/stripes-core are read. Likewise,
 * messages sent via client.postMessage() use the same data.source attribute.
 *
 * The fetch listener and the function it delegates to, passThrough, is
 * where things get interesting. The basic workflow is to check whether
 * a request is bound for Okapi an intercept it in order to perform RTR
 * if necessary, or to let the request pass through.
 *
 * Although JS cannot read the _actual_ timeouts for the AT and RT,
 * those timeouts are also returned in the request-body of the login
 * and refresh endpoints, and those are the values used here to
 * determine whether the AT and RT are expected to be valid. If a request's
 * AT appears valid, or if the request is destined for an endpoint that
 * does not require authorization, the request is passed through. If the
 * AT has expired, an RTR request executes first and then the original
 * request executes after the RTR promise has resolved.
 *
 * When RTR succeeds, a new message with type === TOKEN_EXPIRATION is
 * sent to clients with timeouts from the rotation request in the attribute
 * 'tokenExpiration'. The response is a resolved Promise.
 *
 * When RTR fails, a new message with type === RTR_ERROR is sent to clients
 * with additional details in the attribute 'error'. The response is a
 * rejected Promise.
 *
 */


/** { atExpires, rtExpires } both are JS millisecond timestamps */
let tokenExpiration = null;

/** string FQDN including protocol, e.g. https://some-okapi.somewhere.org */
let okapiUrl = null;

let okapiTenant = null;

/** whether to emit console logs */
let shouldLog = false;

/** lock to indicate whether a rotation request is already in progress */
let isRotating = false;
/** how many times to check the lock before giving up */
const IS_ROTATING_RETRIES = 100;
/** how long to wait before rechecking the lock, in milliseconds (100 * 100) === 10 seconds */
const IS_ROTATING_INTERVAL = 100;

/**
 * TTL_WINDOW
 * How much of a token's TTL can elapse before it is considered expired?
 * This helps us avoid a race-like condition where a token expires in the
 * gap between when we check whether we think it's expired and when we use
 * it to authorize a new request. Say the last RTR response took a long time
 * to arrive, so it was generated at 12:34:56 but we didn't process it until
 * 12:34:59. That could cause problems if (just totally hypothetically) we
 * had an application (again, TOTALLY hypothetically) that was polling every
 * five seconds and one of its requests landed in that three-second gap. Oh,
 * hey STCOR-754, what are you doing here?
 *
 * So this is a buffer. Instead of letting a token be used up until the very
 * last second of its life, we'll consider it expired a little early. This will
 * cause RTR to happen a little early (i.e. a little more frequently) but that
 * should be OK since it increases our confidence that when an AT accompanies
 * the RTR request it is still valid.
 *
 * Value is a float, 0 to 1, inclusive. Closer to 0 means more frequent
 * rotation; 1 means a token is valid up the very last moment of its TTL.
 * 0.8 is just a SWAG at a "likely to be useful" value. Given a 600 second
 * TTL (the current default for ATs) it corresponds to 480 seconds.
 */
export const TTL_WINDOW = 0.8;

/**
 * isValidAT
 * return true if tokenExpiration.atExpires is in the future
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @returns boolean
 */
export const isValidAT = (te) => {
  const isValid = !!(te?.atExpires > Date.now());
  if (shouldLog) console.log(`-- (rtr-sw) => at isValid? ${isValid}; expires ${new Date(te?.atExpires || null).toISOString()}`);
  return isValid;
};

/**
 * isValidRT
 * return true if tokenExpiration.rtExpires is in the future
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @returns boolean
 */
export const isValidRT = (te) => {
  const isValid = !!(te?.rtExpires > Date.now());
  if (shouldLog) console.log(`-- (rtr-sw) => rt isValid? ${isValid}; expires ${new Date(te?.rtExpires || null).toISOString()}`);
  return isValid;
};

/**
 * messageToClient
 * Send a message to clients of this service worker
 * @param {Event} event
 * @param {*} message
 * @returns void
 */
export const messageToClient = async (event, message) => {
  // Exit early if we don't have access to the client.
  // Eg, if it's cross-origin.
  if (!event.clientId) {
    if (shouldLog) console.log('-- (rtr-sw) PASSTHROUGH: no clientId');
    return;
  }

  // Get the client.
  const client = await self.clients.get(event.clientId);
  // Exit early if we don't get the client.
  // Eg, if it closed.
  if (!client) {
    if (shouldLog) console.log('-- (rtr-sw) PASSTHROUGH: no client');
    return;
  }

  // Send a message to the client.
  if (shouldLog) console.log('-- (rtr-sw) => sending', message);
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
export const rtr = async (event) => {
  if (shouldLog) console.log('-- (rtr-sw) ** RTR ...');

  // if several fetches trigger rtr in a short window, all but the first will
  // fail because the RT will be stale after the first request rotates it.
  // the sentinel isRotating indicates that rtr has already started and therefore
  // should not start again; instead, we just need to wait until it finishes.
  // waiting happens in a for-loop that waits a few milliseconds and then rechecks
  // isRotating. hopefully, that process goes smoothly, but we'll give up after
  // IS_ROTATING_RETRIES * IS_ROTATING_INTERVAL milliseconds and return failure.
  if (isRotating) {
    for (let i = 0; i < IS_ROTATING_RETRIES; i++) {
      if (shouldLog) console.log(`-- (rtr-sw) **    is rotating; waiting ${IS_ROTATING_INTERVAL}ms`);
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
    headers: {
      'content-type': 'application/json',
      'x-okapi-tenant': okapiTenant,
    },
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

          if (Array.isArray(json.errors) && json.errors[0]) {
            throw new Error(`${json.errors[0].message} (${json.errors[0].code})`);
          } else {
            throw new Error('RTR response failure');
          }
        });
    })
    .then(json => {
      if (shouldLog) console.log('-- (rtr-sw) **     success!');
      isRotating = false;
      tokenExpiration = {
        atExpires: new Date(json.accessTokenExpiration).getTime(),
        rtExpires: new Date(json.refreshTokenExpiration).getTime(),
      };
      messageToClient(event, { type: 'TOKEN_EXPIRATION', value: tokenExpiration });
    });
};

/**
 * isPermissibleRequest
 * Some requests are always permissible, e.g. auth-n and forgot-password.
 * Others are only permissible if the Access Token is still valid.
 *
 * @param {Request} req clone of the original event.request object
 * @param {object} te token expiration shaped like { atExpires, rtExpires }
 * @param {string} oUrl Okapi URL
 * @returns boolean true if the AT is valid or the request is always permissible
 */
export const isPermissibleRequest = (req, te, oUrl) => {
  if (isValidAT(te)) {
    return true;
  }

  const permissible = [
    '/bl-users/forgotten/password',
    '/bl-users/forgotten/username',
    '/bl-users/login-with-expiry',
    '/bl-users/password-reset',
    '/saml/check',
  ];

  if (shouldLog) console.log(`-- (rtr-sw) AT invalid for ${req.url}`);
  return !!permissible.find(i => req.url.startsWith(`${oUrl}${i}`));
};

/**
 * isLogoutRequest
 * Logout requests are always permissible but need special handling
 * because they should never fail.
 *
 * @param {Request} req clone of the original event.request object
 * @param {string} oUrl okapi URL
 * @returns boolean true if the request URL matches a logout URL
 */
export const isLogoutRequest = (req, oUrl) => {
  const permissible = [
    '/authn/logout',
  ];

  return !!permissible.find(i => req.url.startsWith(`${oUrl}${i}`));
};

/**
 * isOkapiRequest
 * Return true if the request origin matches our okapi URL, i.e. if this is a
 * request that needs to include a valid AT.
 * @param {Request} req
 * @param {string} oUrl okapi URL
 * @returns boolean
 */
export const isOkapiRequest = (req, oUrl) => {
  if (shouldLog) console.log(`-- (rtr-sw) isOkapiRequest: ${new URL(req.url).origin} === ${okapiUrl}`);
  return new URL(req.url).origin === oUrl;
};

/**
 * passThroughWithRT
 * Perform RTR then return the original fetch. on error, post an RTR_ERROR
 * message to clients and return an empty response in a resolving promise.
 *
 * @param {Event} event
 * @returns Promise
 */
const passThroughWithRT = (event) => {
  return rtr(event)
    .then(() => {
      const req = event.request.clone();
      if (shouldLog) console.log('-- (rtr-sw) => post-rtr-fetch', req.url);
      return fetch(event.request, { credentials: 'include' });
    })
    .catch((rtre) => {
      // kill me softly: send an empty response body, which allows the fetch
      // to return without error while the clients catch up, read the RTR_ERROR
      // and handle it, hopefully by logging out.
      // Promise.reject() here would result in every single fetch in every
      // single application needing to thoughtfully handle RTR_ERROR responses.
      messageToClient(event, { type: 'RTR_ERROR', error: rtre });
      return Promise.resolve(new Response(JSON.stringify({})));
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
  if (shouldLog) console.log('-- (rtr-sw)    (valid AT or authn request)');
  return fetch(event.request, { credentials: 'include' })
    .then(response => {
      // Handle three different situations:
      // 1. 403: AT was expired (try RTR)
      // 2. 403: AT was valid but corresponding permissions were insufficent (return response)
      // 3. *: Anything else (return response)
      if (response.status === 403 && response.headers['content-type'] === 'text/plain') {
        return response.clone().text()
          .then(text => {
            // we thought the AT was valid but it wasn't, so try again.
            // if we fail this time, we're done.
            if (text.startsWith('Token missing')) {
              if (shouldLog) console.log('-- (rtr-sw)    (whoops, invalid AT; retrying)');
              return passThroughWithRT(event);
            }

            // we got a 403 but not related to RTR; just pass it along
            return response;
          });
      }

      // any other response should just be returned as-is
      return response;
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
export const passThroughLogout = (event) => {
  if (shouldLog) console.log('-- (rtr-sw)    (logout request)');
  return fetch(event.request, { credentials: 'include' })
    .catch(e => {
      // kill me softly: return an empty response to allow graceful failure
      console.error('-- (rtr-sw) logout failure', e); // eslint-disable-line no-console
      return Promise.resolve(new Response(JSON.stringify({})));
    });
};

/**
 * passThrough
 * Inspect event.request to determine whether it's an okapi request.
 * If it is, make sure its AT is valid or perform RTR before executing it.
 * If it isn't, execute it immediately. If RTR fails catastrophically,
 * post an RTR_ERROR message to clients and return an empty Response in a
 * resolving promise in order to let the top-level error-handler pick it up.
 * @param {Event} event
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @param {string} oUrl okapiUrl
 * @returns Promise
 * @throws if any fetch fails
 */
export const passThrough = (event, te, oUrl) => {
  const req = event.request.clone();

  // okapi requests are subject to RTR
  if (isOkapiRequest(req, oUrl)) {
    if (shouldLog) console.log('-- (rtr-sw) => will fetch', req.url);
    if (isLogoutRequest(req, oUrl)) {
      return passThroughLogout(event);
    }

    if (isPermissibleRequest(req, te, oUrl)) {
      return passThroughWithAT(event);
    }

    if (isValidRT(te)) {
      if (shouldLog) console.log('-- (rtr-sw) =>      valid RT');
      return passThroughWithRT(event);
    }

    // kill me softly: send an empty response body, which allows the fetch
    // to return without error while the clients catch up, read the RTR_ERROR
    // and handle it, hopefully by logging out.
    // Promise.reject() here would result in every single fetch in every
    // single application needing to thoughtfully handle RTR_ERROR responses.
    messageToClient(event, { type: 'RTR_ERROR', error: `AT/RT failure accessing ${req.url}` });
    return Promise.resolve(new Response(JSON.stringify({})));
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
 * handleTokenExpiration
 * Set the AT and RT token expirations to the fraction of their TTL given by
 * TTL_WINDOW. e.g. if a token should be valid for 100 more seconds and TTL_WINDOW
 * is 0.8, set to the expiration time to 80 seconds from now.
 *
 * @param {object} value { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 * @returns { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 */
export const handleTokenExpiration = (value) => ({
  atExpires: Date.now() + ((value.tokenExpiration.atExpires - Date.now()) * TTL_WINDOW),
  rtExpires: Date.now() + ((value.tokenExpiration.rtExpires - Date.now()) * TTL_WINDOW),
});

/**
 * install
 * on install, force this SW to be the active SW
 */
self.addEventListener('install', (event) => {
  if (shouldLog) console.log('-- (rtr-sw) => install', event);
  return self.skipWaiting();
});

/**
 * activate
 * on activate, force this SW to control all in-scope clients,
 * even those that loaded before this SW was registered.
 */
self.addEventListener('activate', (event) => {
  if (shouldLog) console.log('-- (rtr-sw) => activate', event);
  event.waitUntil(self.clients.claim());
});

/**
 * eventListener: message
 * listen for messages from @folio/stripes-core clients and dispatch them accordingly.
 */
self.addEventListener('message', (event) => {
  // only accept events whose origin matches this window's origin,
  // i.e. if this is a same-origin event. Browsers allow cross-origin
  // message exchange, but we're only interested in the events we control.
  if ((!event.origin) || (event.origin !== self.location.origin)) {
    return;
  }

  if (event.data.source === '@folio/stripes-core') {
    if (shouldLog) console.info('-- (rtr-sw) reading', event.data);

    // OKAPI_CONFIG
    if (event.data.type === 'OKAPI_CONFIG') {
      okapiUrl = event.data.value.url;
      okapiTenant = event.data.value.tenant;
    }

    // LOGGER_CONFIG
    if (event.data.type === 'LOGGER_CONFIG') {
      shouldLog = !!event.data.value.categories?.split(',').some(cat => cat === 'rtr-sw');
    }

    // TOKEN_EXPIRATION
    if (event.data.type === 'TOKEN_EXPIRATION') {
      tokenExpiration = handleTokenExpiration(event.data.value);
    }
  }
});

/**
 * eventListener: fetch
 * intercept fetches
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(passThrough(event, tokenExpiration, okapiUrl));
});
