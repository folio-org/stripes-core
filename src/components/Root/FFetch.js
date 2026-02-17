/**
 * TLDR: override global `fetch` and `XMLHttpRequest` to perform RTR for
 * FOLIO API requests.
 *
 * RTR Primers:
 * @see https://authjs.dev/guides/refresh-token-rotation
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
 *
 * Our AT and RT live in HTTP-only cookies, so the JS code doesn't have access
 * to them. The AT cookie accompanies every request, and the RT cookie is sent
 * only in refresh requests.
 *
 * The basic plot is to trap failed API requests and inspect the reason for
 * failure. If it was an authentication failure, stash the request, rotate the
 * tokens, then replay the original request. If the request failed for other
 * reasons, allow that failure to bubble to the calling application. If the
 * rotation request itself fails, that indicates we have no AT and no RT; this
 * is an unrecoverable situation and the session is terminated.
 *
 *
 * Logging categories:
 *   rtr: rotation
 *   rtrv: verbose
 *
 */


import { RTR_LOCK_KEY, rotateAndReplay } from './rotateAndReplay';

import { getTokenExpiry } from '../../loginServices';
import {
  isFolioApiRequest,
} from './token-util';
import {
  RTRError,
} from './Errors';
import {
  RTR_ERROR_EVENT,
} from './constants';
import FXHR from './FXHR';

const OKAPI_FETCH_OPTIONS = {
  credentials: 'include',
  mode: 'cors',
};

export class FFetch {
  constructor({ logger, okapi, onRotate }) {
    this.logger = logger;
    this.okapi = okapi;
    this.onRotate = onRotate;
  }

  /**
   * save a reference to fetch, and then reassign the global :scream:
   */
  replaceFetch = () => {
    this.nativeFetch = globalThis.fetch;
    globalThis.fetch = this.ffetch;
  };

  /**
   * save a reference to XMLHttpRequest, and then reassign the global :scream:
   */
  replaceXMLHttpRequest = () => {
    this.NativeXHR = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = FXHR(this);
  };

  /**
   * rotationConfig
   * This config object is passed to rotateAndReplay, providing callbacks
   * (rotate, onSuccess, onFailure) and config'y values like the list
   * of status-codes that indicate an authentication failure that could be
   * fixed after rotation. Probably, this WHOLE object should be lifted up
   * a level and provided by Root to FFetch instead of configured here
   * since there we have access to stripes.config.js values that may be
   * useful, e.g. configuring how long to wait for rotation to timeout.
   */
  rotationConfig = {
    // statuscodes to intercept
    // optional; defaults to 401
    statusCodes: [400, 401],

    // timeout in milliseconds
    // optional; defaults to 30s
    // refreshTimeout: ms('30s'),

    // fetch options
    // configure request options with the token attached, headers munged, etc
    options: (options = {}) => {
      return { ...options, ...OKAPI_FETCH_OPTIONS };
    },

    // alternative to status code inspection? ugh, have to read the body :(
    // shouldRotate: async (response) => {
    //   const cr = response.clone();
    //   const text = await cr.text();
    //   return response.status === 400 && text.startsWith('Token missing, access requires permission');
    // },

    // handle rotation
    rotate: async () => {
      const res = await this.nativeFetch.apply(globalThis, [`${this.okapi.url}/authn/refresh`, {
        headers: {
          'content-type': 'application/json',
          'x-okapi-tenant': this.okapi.tenant,
        },
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      }]);

      try {
        if (res.ok) {
          const json = await res.json();
          if (json.accessTokenExpiration && json.refreshTokenExpiration) {
            return {
              accessTokenExpiration: json.accessTokenExpiration,
              refreshTokenExpiration: json.refreshTokenExpiration,
            };
          }

          throw new RTRError('accessTokenExpiration and/or refreshTokenExpiration were not available');
        }

        throw new RTRError('Rotation response was not ok');
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        throw new RTRError('Rotation failure!', { cause: err });
      }
    },

    // return true if a valid token is available
    isValidToken: async () => {
      try {
        const expiry = await getTokenExpiry();
        this.logger.log('rtr', `isValidToken ? ${expiry?.atExpires} > ${Date.now()} ? ${expiry?.atExpires > Date.now()}`);
        return expiry?.atExpires > Date.now();
      } catch (err) {
        // swallow the error
        this.logger.log('rtrv', { err });
      }
      return false;
    },

    // rotation succeeded: call the success-callback
    onSuccess: async (newTokens) => {
      await this.onRotate(newTokens);
    },

    // 😱 what to do, what to do? log the error, emit RTR_ERROR_EVENT
    onFailure: async (error) => {
      console.error('Session expired', error); // eslint-disable-line no-console
      globalThis.dispatchEvent(new Event(RTR_ERROR_EVENT));
    },
  };

  /**
   * ffetch
   * ffetch (FOLIO-fetch) provides an RTR-wrapper around fetch requests for
   * FOLIO API requests. It pauses fetching while rotation is in-flight, and
   * if a response is not successful (!response.ok), it invokes RTR. RTR will
   * inspect the response, rotate if necessary, then replay and return the
   * original request, or it
   *
   * see if the failure was due to authentication (in which case it'll rotate
   * and replay the request).
   *
   * @param {object} resource a fetchable resource
   * @param {object} options fetch options
   * @returns Promise
   */
  ffetch = async (resource, options = {}) => {
    if (isFolioApiRequest(resource, this.okapi.url)) {
      try {
        let response;

        // readers/writer lock pattern: don't fetch while rotation is in-progress
        // https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
        // with a fallback for old (er, incomplete?) envs that don't support
        // navigator.locks (👋 jsdom)
        if (navigator?.locks?.request) {
          response = await navigator.locks.request(RTR_LOCK_KEY, { mode: 'shared' }, async () => {
            const fr = await this.nativeFetch.apply(globalThis, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
            return fr;
          });
        } else {
          response = await this.nativeFetch.apply(globalThis, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
        }

        if (!response?.ok) {
          response = await rotateAndReplay(
            this.nativeFetch,
            { ...this.rotationConfig, logger: this.logger },
            { response, resource, options }
          );
        }

        return response;
      } catch (err) {
        // we can end up here for three reasons:
        // 1. the original request itself failed
        // 2. rotation failed
        // 3. rotation was unnecessary and it rejected with the original reponse
        //
        // For #3, we just want to return that response, allowing it to bubble
        // to the original caller to deal with as they choose. For the others,
        // this is a legit error so we re-throw it rather than returning it.
        if (err.response) {
          return err.response;
        }

        throw err;
      }
    }

    // default: pass requests through to the network
    return this.nativeFetch.apply(globalThis, [resource, options]);
  };
}
