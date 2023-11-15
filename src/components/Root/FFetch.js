/**
 * TLDR: override global fetch to perform refresh-token-rotation for Okapi requests.
 *
 * The gory details:
 * The fetch listener and the function it delegates to, passThrough, is
 * where things get interesting. The basic workflow is to check whether
 * a request is bound for Okapi and intercept it in order to perform RTR
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

import { okapi } from 'stripes-config';
import { getTokenExpiry, setTokenExpiry } from './token-util';
import { RTRError } from './Errors';

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
const TTL_WINDOW = 0.8;

/**
 * isLogoutRequest
 * Logout requests are always permissible but need special handling
 * because they should never fail.
 *
 * @param {Request} req clone of the original event.request object
 * @param {string} oUrl okapi URL
 * @returns boolean true if the request URL matches a logout URL
 */
export const isLogoutRequest = (resource, oUrl) => {
  const permissible = [
    '/authn/logout',
  ];

  return !!permissible.find(i => resource.startsWith(`${oUrl}${i}`));
};

/**
 * isOkapiRequest
 * Return true if the request origin matches our okapi URL, i.e. if this is a
 * request that needs to include a valid AT.
 * @param {Request} req
 * @param {string} oUrl okapi URL
 * @returns boolean
 */
export const isOkapiRequest = (resource, oUrl) => {
  if (typeof resource === 'string') {
    return resource.startsWith(oUrl);
  } else if (resource instanceof URL) {
    return undefined.origin.startsWith(oUrl);
  } else if (resource instanceof Request) {
    return resource.url.startsWith(oUrl);
  }

  console.warn('Unexpected resource', resource); // eslint-disable-line no-console
  return false;
};

/**
 * isValidAT
 * return true if tokenExpiration.atExpires is in the future
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @returns boolean
 */
export const isValidAT = (te, logger) => {
  const isValid = !!(te?.atExpires > Date.now());
  logger.log('rtr', `AT isValid? ${isValid}; expires ${new Date(te?.atExpires || null).toISOString()}`);
  return isValid;
};

/**
 * isValidRT
 * return true if tokenExpiration.rtExpires is in the future
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @returns boolean
 */
export const isValidRT = (te, logger) => {
  const isValid = !!(te?.rtExpires > Date.now());
  logger.log('rtr', `RT isValid? ${isValid}; expires ${new Date(te?.rtExpires || null).toISOString()}`);
  return isValid;
};

/**
 * adjustTokenExpiration
 * Set the AT and RT token expirations to the fraction of their TTL given by
 * TTL_WINDOW. e.g. if a token should be valid for 100 more seconds and TTL_WINDOW
 * is 0.8, set to the expiration time to 80 seconds from now.
 *
 * @param {object} value { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 * @returns { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 */
export const adjustTokenExpiration = (value) => ({
  atExpires: Date.now() + ((value.tokenExpiration.atExpires - Date.now()) * TTL_WINDOW),
  rtExpires: Date.now() + ((value.tokenExpiration.rtExpires - Date.now()) * TTL_WINDOW),
});

export class FFetch {
  constructor({ logger }) {
    this.logger = logger;
    logger.log('rtr', 'BETTER START HANGIN\' TOUGH; WE\'RE GONNA OVERRIDE FETCH');
    // save a reference to fetch, and then reassign the global :scream:
    this.ogFetch = global.fetch;
    global.fetch = this.nkotbFetch; // eslint-disable-line no-global-assign
  }

  /** { atExpires, rtExpires } both are JS millisecond timestamps */
  tokenExpiration = null;

  /** lock to indicate whether a rotation request is already in progress */
  // @@ needs to be stored in localforage???
  isRotating = false;

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
  rtr = async () => {
    this.logger.log('rtr', '** RTR ...');

    // if several fetches trigger rtr in a short window, all but the first will
    // fail because the RT will be stale after the first request rotates it.
    // the sentinel isRotating indicates that rtr has already started and therefore
    // should not start again; instead, we just need to wait until it finishes.
    // waiting happens in a for-loop that waits a few milliseconds and then rechecks
    // isRotating. hopefully, that process goes smoothly, but we'll give up after
    // IS_ROTATING_RETRIES * IS_ROTATING_INTERVAL milliseconds and return failure.
    if (this.isRotating) {
      for (let i = 0; i < IS_ROTATING_RETRIES; i++) {
        this.logger.log('rtr', `**    is rotating; waiting ${IS_ROTATING_INTERVAL}ms`);
        await new Promise(resolve => setTimeout(resolve, IS_ROTATING_INTERVAL));
        if (!this.isRotating) {
          return Promise.resolve();
        }
      }
      // all is lost
      return Promise.reject(new Error('in-process RTR timed out'));
    }

    this.isRotating = true;
    try {
      return this.ogFetch.apply(global, [`${okapi.url}/authn/refresh`, {
        headers: {
          'content-type': 'application/json',
          'x-okapi-tenant': okapi.tenant,
        },
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      }])
        .then(res => {
          if (res.ok) {
            return res.json();
          }

          // rtr failure. return an error message if we got one.
          return res.json()
            .then(json => {
              this.isRotating = false;

              if (Array.isArray(json.errors) && json.errors[0]) {
                throw new Error(`${json.errors[0].message} (${json.errors[0].code})`);
              } else {
                throw new Error('RTR response failure');
              }
            });
        })
        .then(json => {
          this.logger.log('rtr', '**     success!');
          this.isRotating = false;
          return adjustTokenExpiration({
            tokenExpiration: {
              atExpires: new Date(json.accessTokenExpiration).getTime(),
              rtExpires: new Date(json.refreshTokenExpiration).getTime(),
            }
          });
        })
        .then(te => {
          return setTokenExpiry(te);
        });
    } catch (err) {
      // failed fetch from RTR service.
      throw new RTRError(err);
    }
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
  isPermissibleRequest = (resource, te, oUrl) => {
    if (isValidAT(te, this.logger)) {
      return true;
    }

    const permissible = [
      '/bl-users/forgotten/password',
      '/bl-users/forgotten/username',
      '/bl-users/login-with-expiry',
      '/bl-users/password-reset',
      '/saml/check',
    ];

    this.logger.log('rtr', `AT invalid for ${resource}`);
    return !!permissible.find(i => resource.startsWith(`${oUrl}${i}`));
  };


  /**
   * passThroughWithRT
   * Perform RTR then return the original fetch. on error, post an RTR_ERROR
   * message to clients and return an empty response in a resolving promise.
   *
   * @param {Event} event
   * @returns Promise
   */
  passThroughWithRT = (resource, options) => {
    return this.rtr()
      .then(() => {
        this.logger.log('rtr', 'post-rtr-fetch', resource);
        return this.ogFetch.apply(global, [resource, options]);
      })
      .catch((rtre) => {
        // kill me softly: send an empty response body, which allows the fetch
        // to return without error while the clients catch up, read the RTR_ERROR
        // and handle it, hopefully by logging out.
        // Promise.reject() here would result in every single fetch in every
        // single application needing to thoughtfully handle RTR_ERROR responses.
        console.error(rtre);
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
  passThroughWithAT = (resource, options) => {
    this.logger.log('rtr', '   (valid AT or authn request)');
    return this.ogFetch.apply(global, [resource, options])
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
                this.logger.log('rtr', '   (whoops, invalid AT; retrying)');
                return this.passThroughWithRT(resource, options);
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
  passThroughLogout = (resource, options) => {
    this.logger.log('rtr', '   (logout request)');
    return this.ogFetch.apply(global, [resource, { ...options, credentials: 'include' }])
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
  nkotbFetch = async (resource, options) => {
    // okapi requests are subject to RTR
    if (isOkapiRequest(resource, okapi.url)) {
      this.logger.log('rtr', 'will fetch', resource);
      try {
        if (isLogoutRequest(resource, okapi.url)) {
          return this.passThroughLogout(resource, options);
        }

        const te = await getTokenExpiry();
        if (this.isPermissibleRequest(resource, te, okapi.url)) {
          return this.passThroughWithAT(resource, options);
        }

        if (isValidRT(te, this.logger)) {
          this.logger.log('rtr', '     valid RT');
          return this.passThroughWithRT(resource, options);
        }

        // kill me softly: send an empty response body, which allows the fetch
        // to return without error while the clients catch up, read the RTR_ERROR
        // and handle it, hopefully by logging out.
        // Promise.reject() here would result in every single fetch in every
        // single application needing to thoughtfully handle RTR_ERROR responses.
        // @@this.messageToClient(event, { type: 'RTR_ERROR', error: `AT/RT failure accessing ${req.url}` });
        return Promise.resolve(new Response(JSON.stringify({})));
      } catch (err) {
        if (err instanceof RTRError) {
          // implement retries?
          // logout?
          console.log('caught an rtr error, ma!');
        }
      }
    }

    // default: pass requests through to the network
    // console.log('-- (rtr-sw) passThrough NON-OKAPI', resource);
    return Promise.resolve(this.ogFetch.apply(global, [resource, options]));
  };
}
