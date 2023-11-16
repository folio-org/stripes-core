/**
 * TLDR: override global fetch to perform token-rotation for FOLIO API requests.
 *
 * The gory details:
 * The basic workflow is to check whether a request is bound for a FOLIO API,
 * intercepting those that are and making sure they are accompanied by
 * valid tokens.
 *
 * Although JS cannot read the _actual_ timeouts for the AT and RT,
 * those timeouts are also returned in the request-body of the login
 * and refresh endpoints, and those are the values used here to
 * determine whether the AT and RT are expected to be valid. If a request's
 * AT appears valid, or if the request is destined for an endpoint that
 * does not require authorization, the request is passed through. If the
 * AT has expired, an RTR request executes first and then the original
 * request executes after the RTR promise resolves and new expiration data
 * is cached locally (in an instance variable) and in local storage (to
 * support the case where multiple tabs are open and one tab performs RTR
 * without the other knowing).
 *
 * Fetches can fail in a variety of ways, but there are really only two
 * categories that are relevant here:
 *
 * 1 Failure due to RTR
 * 2 Failure due to anything else
 *
 * RTR failures should cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests.
 *
 */

import { okapi } from 'stripes-config';
import { getTokenExpiry, rtr, resourceMapper, isFolioApiRequest, isLogoutRequest } from './token-util';
import { RTRError, UnexpectedResourceError } from './Errors';
import FXHR from './FXHR';

/**
 * isValidAT
 * Return true if tokenExpiration.atExpires is in the future; false otherwise.
 *
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @param {@folio/stripes/logger} logger
 * @returns boolean
 */
export const isValidAT = (te, logger) => {
  const isValid = !!(te?.atExpires > Date.now());
  logger.log('rtr', `AT isValid? ${isValid}; expires ${new Date(te?.atExpires || null).toISOString()}`);
  return isValid;
};

/**
 * isValidRT
 * Return true if tokenExpiration.rtExpires is in the future; false otherwise.
 *
 * @param {object} te tokenExpiration shaped like { atExpires, rtExpires }
 * @param {@folio/stripes/logger} logger
 * @returns boolean
 */
export const isValidRT = (te, logger) => {
  const isValid = !!(te?.rtExpires > Date.now());
  logger.log('rtr', `RT isValid? ${isValid}; expires ${new Date(te?.rtExpires || null).toISOString()}`);
  return isValid;
};

export class FFetch {
  constructor({ logger }) {
    this.logger = logger;
    logger.log('rtr', 'BETTER START HANGIN\' TOUGH; WE\'RE GONNA OVERRIDE FETCH');
    // save a reference to fetch, and then reassign the global :scream:
    this.ogFetch = global.fetch;
    global.fetch = this.nkotbFetch; // eslint-disable-line no-global-assign

    this.NativeXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = FXHR(this);
  }

  /** { atExpires, rtExpires } both are JS millisecond timestamps */
  tokenExpiration = null;

  /** lock to indicate whether a rotation request is already in progress */
  // @@ needs to be stored in localforage???
  isRotating = false;

  /**
   * isPermissibleRequest
   * Some requests are always permissible, e.g. auth-n and forgot-password.
   * Others are only permissible if the Access Token is still valid.
   *
   * @param {*} resource one of string, URL, Request
   * @param {object} te token expiration shaped like { atExpires, rtExpires }
   * @param {string} oUrl FOLIO API origin
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

    const isPermissibleResource = (string) => {
      return !!permissible.find(i => string.startsWith(`${oUrl}${i}`));
    };

    this.logger.log('rtr', `AT invalid for resource ${resource}`);
    try {
      return resourceMapper(resource, isPermissibleResource);
    } catch (rme) {
      if (rme instanceof UnexpectedResourceError) {
        console.warn(rme.message, resource); // eslint-disable-line no-console
        return false;
      }

      throw rme;
    }
  };

  /**
   * passThroughWithRT
   * Perform RTR then return the original fetch. on error, post an RTR_ERROR
   * message to clients and return an empty response in a resolving promise.
   *
   * @param {*} resource one of string, URL, Request
   * @params {object} options
   * @returns Promise
   */
  passThroughWithRT = (resource, options) => {
    return rtr(this)
      .then(() => {
        this.logger.log('rtr', 'post-rtr-fetch', resource);
        return this.ogFetch.apply(global, [resource, options]);
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
   *
   * @param {*} resource and resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  passThroughWithAT = (resource, options) => {
    this.logger.log('rtr', '   (valid AT or authn request)');
    return this.ogFetch.apply(global, [resource, { ...options, credentials: 'include' }])
      .then(response => {
        // Handle three different situations:
        // 1. 403 (which should be a 401): AT was expired (try RTR)
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
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
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
   * Inspect resource to determine whether it's a FOLIO API request.
   * If it is, make sure its AT is valid or perform RTR before executing it.
   * If it isn't, execute it immediately. If RTR fails catastrophically,
   * post an RTR_ERROR event (so a global event handler can pick up the error)
   * and return Promise.resolve with a dummy Response to avoid blowing up
   * application-local error handlers (er, the lack of application-level error
   * handlers).
   *
   * @param {*} resource one of string, URL, Request
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  nkotbFetch = async (resource, options) => {
    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, okapi.url)) {
      this.logger.log('rtr', 'will fetch', resource);
      try {
        if (isLogoutRequest(resource, okapi.url)) {
          return this.passThroughLogout(resource, options);
        }

        // if our cached tokens appear to have expired, pull them from storage.
        // maybe another window updated them for us without us knowing.
        if (!isValidAT(this.tokenExpiration, this.logger)) {
          this.logger.log('rtr', 'local tokens expired; fetching from storage');
          this.tokenExpiration = await getTokenExpiry();
        }

        if (this.isPermissibleRequest(resource, this.tokenExpiration, okapi.url)) {
          return this.passThroughWithAT(resource, options);
        }

        return this.passThroughWithRT(resource, options);
      } catch (err) {
        // if we got an RTR error, that's on us; logout!
        // every other problem is somebody else's problem
        // and we rethrow for them to handle it.
        if (err instanceof RTRError) {
          console.error('caught an rtr error, ma!');
          // @@ dispatchEvent(RTR failure)
        } else {
          throw err;
        }
      }
    }

    // default: pass requests through to the network
    return Promise.resolve(this.ogFetch.apply(global, [resource, options]));
  };
}
