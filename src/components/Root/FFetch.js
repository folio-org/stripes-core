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
 * RTR failures will cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests; thus, such errors are untrapped and bubble up.
 *
 * The gross gory details:
 * In an ideal world, we would simply export a function and a class and
 * tell folks to use those, but we don't live in that world, at least not
 * yet. So. For now, we override the global implementations in `replace...`
 * methods so any calls directly invoking `fetch()` or instantiating
 * `XMLHttpRequest` get these updated versions that handle token rotation
 * automatically.
 *
 * Logging categories:
 *   rtr: rotation
 *   rtrv: verbose
 *
 */

import ms from 'ms';
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
   * Set a timeout to rotate the AT before it expires. Stash the timer-id
   * in redux so the setRtrTimeout action can be used to cancel the existing
   * timer when a new one is set.
   *
   * The rotation interval is set to a fraction of the AT's expiration
   * time, e.g. if the AT expires in 1000 seconds and the fraction is .8,
   * the timeout will be 800 seconds.
   *
   * @param {object} res object shaped like { accessTokenExpiration, refreshTokenExpiration }
   *   where the values are ISO-8601 datestamps like YYYY-MM-DDTHH:mm:ssZ
   */
  rotateCallback = (res) => {
    this.logger.log('rtr', 'rotation callback setup');

    // set a short rotation interval by default, then inspect the response for
    // token-expiration data to use instead if available. not all responses
    // (e.g. those from _self) contain token-expiration values, so it is
    // necessary to provide a default.
    let rotationInterval = 10 * 1000;
    if (res?.accessTokenExpiration) {
      rotationInterval = (new Date(res.accessTokenExpiration).getTime() - Date.now()) * RTR_AT_TTL_FRACTION;
    }

    this.logger.log('rtr', `rotation fired from rotateCallback; next callback in ${ms(rotationInterval)}`);
    this.store.dispatch(setRtrTimeout(setTimeout(() => {
      rtr(this.nativeFetch, this.logger, this.rotateCallback);
    }, rotationInterval)));
  }

  /**
   * ffetch
   * Inspect resource to determine whether it's a FOLIO API request.
   * * If it is an authentication-related request, complete the request
   *   and then execute the RTR callback to initiate that cycle.
   * * If it is a logout request, complete the request and swallow any
   *   errors because ... what would be the point of a failed logout
   *   request? It's telling you "you couldn't call /logout because
   *   you didn't have a cookie" i.e. you're already logged out".
   * * If it is a regular request, make sure RTR isn't in-flight (which
   *   would cause this request to fail if the RTR request finished
   *   processing first, because it would invalidate the old AT) and
   *   then proceed.
   *   If we catch an RTR error, emit a RTR_ERR_EVENT on the window and
   *   then swallow the error, allowing the application-level event handlers
   *   to handle that event.
   *   If we catch any other kind of error, re-throw it because it represents
   *   an application-specific problem that needs to be handled by an
   *   application-specific handler.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  ffetch = async (resource, options = {}) => {
    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, okapi.url)) {
      this.logger.log('rtrv', 'will fetch', resource);

      // on authentication, grab the response to kick of the rotation cycle,
      // then return the response
      if (isAuthenticationRequest(resource, okapi.url)) {
        this.logger.log('rtr', 'authn request');
        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .then(res => {
            this.logger.log('rtr', 'authn success!');
            // a response can only be read once, so we clone it to grab the
            // tokenExpiration in order to kick of the rtr cycle, then return
            // the original
            res.clone().json().then(json => {
              this.rotateCallback(json.tokenExpiration);
            });

            return res;
          });
      }

      // on logout, never fail
      // if somebody does something silly like delete their cookies and then
      // tries to logout, the logout request will fail. And that's fine, just
      // fine. We will let them fail, capturing the response and swallowing it
      // to avoid getting stuck in an error loop.
      if (isLogoutRequest(resource, okapi.url)) {
        this.logger.log('rtr', 'logout request');

        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .catch(err => {
            // kill me softly: return an empty response to allow graceful failure
            console.error('-- (rtr-sw) logout failure', err); // eslint-disable-line no-console
            return Promise.resolve(new Response(JSON.stringify({})));
          });
      }

      return getPromise(this.logger)
        .then(() => {
          this.logger.log('rtrv', 'post-rtr-fetch', resource);
          return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
        })
        .catch(err => {
          if (err instanceof RTRError) {
            console.error('RTR failure', err); // eslint-disable-line no-console
            window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
            return Promise.resolve(new Response(JSON.stringify({})));
          }

          throw err;
        });
    }

    // default: pass requests through to the network
    return Promise.resolve(this.nativeFetch.apply(global, [resource, options]));
  };
}
