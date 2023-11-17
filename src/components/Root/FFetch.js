/* eslint-disable import/prefer-default-export */

/**
 * TLDR: override global `fetch` and `XMLHttpRequest` to perform RTR for FOLIO API requests.
 *
 * RTR Primers:
 * @see https://authjs.dev/guides/basics/refresh-token-rotation
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
 *
 * Our AT and RT live in HTTP-only cookies, so the JS code doesn't have access
 * to them. The AT cookie accompanies every request, and the RT cookie is sent
 * only in refresh requests.
 *
 * The basic workflow here is intercept requests for FOLIO APIs and trap
 * response failures that are caused by expired ATs, conduct RTR, then replay
 * the original requests. FOLIO API requests that arrive while RTR is in-process
 * are held until RTR finishes and then allowed to flow through. AT failure is
 * recognized in a response with status code 403 and an error message beginning with
 * "Token missing". (Eventually, it may be 401 instead, but not today.) Requests
 * to non-FOLIO APIs flow through without intervention.
 *
 * RTR failures should cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests.
 *
 * The gross gory details:
 * In an ideal world, we would simply export a function and a class and
 * tell folks to use those, but we don't live in that world, at least not
 * yet. So. For now, we override the global implementations in the constructor
 * :scream: so any calls directly invoking `fetch()` or instantiating
 * `XMLHttpRequest` get these updated versions that handle token rotation
 * automatically.
 *
 */

import { okapi } from 'stripes-config';
import { rtr, isFolioApiRequest, isLogoutRequest } from './token-util';
import { RTRError, RTR_ERROR_EVENT } from './Errors';
import FXHR from './FXHR';

export class FFetch {
  constructor({ logger }) {
    this.logger = logger;

    // save a reference to fetch, and then reassign the global :scream:
    this.nativeFetch = global.fetch;
    global.fetch = this.ffetch;

    this.NativeXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = FXHR(this);
  }

  /** { atExpires, rtExpires } both are JS millisecond timestamps */
  tokenExpiration = null;

  /** lock to indicate whether a rotation request is already in progress */
  // @@ needs to be stored in localforage???
  isRotating = false;

  /**
   * passThroughWithRT
   * Perform RTR then return the response to the original request.
   *
   * @param {*} resource one of string, URL, Request
   * @params {object} options
   * @returns Promise
   */
  passThroughWithRT = async (resource, options) => {
    return rtr(this)
      .then(() => {
        this.logger.log('rtr', 'post-rtr-fetch', resource);
        return this.nativeFetch.apply(global, [resource, options]);
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
    return this.nativeFetch.apply(global, [resource, { ...options, credentials: 'include' }])
      .catch(e => {
        // kill me softly: return an empty response to allow graceful failure
        console.error('-- (rtr-sw) logout failure', e); // eslint-disable-line no-console
        return Promise.resolve(new Response(JSON.stringify({})));
      });
  };

  /**
   * passThrough
   * Inspect resource to determine whether it's a FOLIO API request.
   * Handle it with RTR if it is; let it trickle through if not.
   *
   * Given we believe the AT to be valid, pass the fetch through.
   * If it fails, maybe our beliefs were wrong, maybe everything is wrong,
   * maybe there is no God, or there are many gods, or god is a she, or
   * she is a he, or Lou Reed is god. Or maybe we were just wrong about the
   * AT and we need to conduct token rotation, so try that. If RTR succeeds,
   * yay, pass through the fetch as we originally intended because now we
   * know the AT will be valid. If RTR fails, then it doesn't matter about
   * Lou Reed. He may be god. We'll dispatch an RTR_ERROR_EVENT and then
   * return a dummy promise, which gives the root-level (stripes-core level)
   * event handler the opportunity to respond (presumably by logging out)
   * without tripping up the application-level error handler which isn't
   * responsible for handling such things.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  ffetch = async (resource, options) => {
    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, okapi.url)) {
      this.logger.log('rtr', 'will fetch', resource);

      // logout requests must not fail
      if (isLogoutRequest(resource, okapi.url)) {
        return this.passThroughLogout(resource, options);
      }

      return this.nativeFetch.apply(global, [resource, options])
        .then(response => {
          // Handle three different situations:
          // 1. 403 (which should be a 401): AT was expired (try RTR)
          // 2. 403: AT was valid but corresponding permissions were insufficent (return response)
          // 3. *: Anything else (return response)
          if (response.status === 403 && response.headers.get('content-type') === 'text/plain') {
            return response.clone().text()
              .then(async (text) => {
                // if the request failed due to a missing token, attempt RTR.
                // if we fail this time, we're done.
                if (text.startsWith('Token missing')) {
                  this.logger.log('rtr', '   (whoops, invalid AT; retrying)');
                  return this.passThroughWithRT(resource, options)
                    .catch(err => {
                      if (err instanceof RTRError) {
                        console.error('RTR failure', err); // eslint-disable-line no-console
                        document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
                        return Promise.resolve(new Response(JSON.stringify({})));
                      }

                      // we don't expect to end up here because if we do,
                      // it means RTR failed, but not with an RTR-related
                      // error. that would certainly be unexpected.
                      throw err;
                    });
                }

                // we got a 403 but not related to RTR; just pass it along
                return response;
              });
          }

          // any other response should just be returned as-is
          return response;
        });
    }

    // default: pass requests through to the network
    return Promise.resolve(this.nativeFetch.apply(global, [resource, options]));
  };
}
