/* eslint-disable import/prefer-default-export */

/**
 * TLDR: override global `fetch` and `XMLHttpRequest` to perform RTR for
 * FOLIO API requests.
 *
 * RTR Primers:
 * @see https://authjs.dev/guides/basics/refresh-token-rotation
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
 *
 * Our AT and RT live in HTTP-only cookies, so the JS code doesn't have access
 * to them. The AT cookie accompanies every request, and the RT cookie is sent
 * only in refresh requests.
 *
 * The basic plot here is that RTR requests happen independently of other
 * activity. The login-response is used to trigger the RTR cycle, which then
 * continues in perpetuity until logout. Likewise, the response from each RTR
 * request is used to start the timer that will trigger the next round in the
 * cycle.
 *
 * Requests that arrive while RTR is in flight are held until the RTR promise
 * resolves and then processed. This avoids the problem of a request's AT
 * expiring (or changing, if RTR succeeds) while it is in-flight.
 *
 * RTR failures should cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests.
 *
 * The gross gory details:
 * In an ideal world, we would simply export a function and a class and
 * tell folks to use those, but we don't live in that world, at least not
 * yet. So. For now, we override the global implementations in `replace...`
 * methods so any calls directly invoking `fetch()` or instantiating
 * `XMLHttpRequest` get these updated versions that handle token rotation
 * automatically.
 *
 */

import { okapi } from 'stripes-config';
import {
  setRtrTimeout
} from '../../okapiActions';

import {
  getPromise,
  isAuthenticationRequest,
  isFolioApiRequest,
  isLogoutRequest,
  rtr,
} from './token-util';
import {
  RTRError,
} from './Errors';
import {
  RTR_AT_TTL_FRACTION,
  RTR_ERROR_EVENT,
} from './constants';

import FXHR from './FXHR';

const OKAPI_FETCH_OPTIONS = {
  credentials: 'include',
  mode: 'cors',
};

export class FFetch {
  constructor({ logger, store }) {
    this.logger = logger;
    this.store = store;
  }

  /**
   * save a reference to fetch, and then reassign the global :scream:
   */
  replaceFetch = () => {
    this.nativeFetch = global.fetch;
    global.fetch = this.ffetch;
  };

  /**
   * save a reference to XMLHttpRequest, and then reassign the global :scream:
   */
  replaceXMLHttpRequest = () => {
    this.NativeXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = FXHR(this);
  };

  /**
   * rotateCallback
   * Set a timeout
   * @param {object} res object shaped like { accessTokenExpiration, refreshTokenExpiration }
   *   where the values are ISO-8601 datestamps like YYYY-MM-DDTHH:mm:ssZ
   */
  rotateCallback = (res) => {
    this.logger.log('rtr', 'rotateCallback setup');
    const callbackInterval = (new Date(res.accessTokenExpiration).getTime() - Date.now()) * RTR_AT_TTL_FRACTION;
    // const callbackInterval = 10 * 1000; // rotate every 10 seconds
    this.store.dispatch(setRtrTimeout(setTimeout(() => {
      this.logger.log('rtr', 'firing rotation from rotateCallback');
      rtr(this, this.rotateCallback);
    }, callbackInterval)));
  }

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
  ffetch = async (resource, ffOptions = {}) => {
    const { rtrIgnore = false, ...options } = ffOptions;

    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, okapi.url)) {
      this.logger.log('rtr', 'will fetch', resource);

      // on authentication, grab the response to kick of the rotation cycle,
      // then return the response
      if (isAuthenticationRequest(resource, okapi.url)) {
        this.logger.log('rtr', 'authn pending...');
        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .then(res => {
            this.logger.log('rtr', 'authn success!');
            this.rotateCallback(res);
            return res;
          });
      }

      // on logout, never fail
      // if somebody does something silly like delete their cookies and then
      // tries to logout, the logout request will fail. And that's fine, just
      // fine. We will let them fail, capturing the response and swallowing it
      // to avoid getting stuck in an error loop.
      if (isLogoutRequest(resource, okapi.url)) {
        this.logger.log('rtr', '   (logout request)');

        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .catch(err => {
            // kill me softly: return an empty response to allow graceful failure
            console.error('-- (rtr-sw) logout failure', err); // eslint-disable-line no-console
            return Promise.resolve(new Response(JSON.stringify({})));
          });
      }

      return getPromise(this.logger)
        .then(() => {
          this.logger.log('rtr', 'post-rtr-fetch', resource);
          return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
        })
        .catch(err => {
          if (err instanceof RTRError) {
            console.error('RTR failure', err); // eslint-disable-line no-console
            document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
            return Promise.resolve(new Response(JSON.stringify({})));
          }

          throw err;
        });
    }

    // default: pass requests through to the network
    return Promise.resolve(this.nativeFetch.apply(global, [resource, options]));
  };
}
