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

const FOLIO_FETCH_OPTIONS = {
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
    // statusCodes
    // list of response status-codes to intercept
    // optional; defaults to [401]

    // refreshTimeout
    // timeout in milliseconds
    // optional; defaults to 30s

    // options
    // function that receives the original request options and returns the
    // options-object that will be used on the replayed request.
    options: (options = {}) => {
      return { ...options, ...FOLIO_FETCH_OPTIONS };
    },

    // shouldRotate
    // alternative to status code inspection when a response is present:
    // deal with Okapi's non-standard 400 response for missing/invalid tokens,
    // as well as /users-keycloak's 404 response for missing token
    // by cloning the response and inspecting the body text.
    // optional; defaults to a function that resolves to false, i.e. do not force rotation
    shouldRotate: async (response) => {
      if (response) {
        const cr = response.clone();
        const text = await cr.text();
        return (
          (response.status === 400 && text.startsWith('Token missing, access requires permission')) ||
          (response.status === 404 && response.url?.includes('/users-keycloak/_self')) ||
          (response.status === 404 && response.url?.includes('/bl-users/_self')) ||
          (response.status === 422 && response.url?.includes('/authn/logout'))
        );
      }

      return false;
    },

    // rotate
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

    // onSuccess
    // rotation succeeded: call the success-callback
    onSuccess: async (newTokens) => {
      await this.onRotate(newTokens);
    },

    // onFailure
    // 😱 what to do, what to do? log the error, emit RTR_ERROR_EVENT, which
    // has a listener in SessionEventContainer that will terminate the session.
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
   * inspect the response, rotate if necessary, then replay the request and
   * return its response.
   *
   * @param {object} resource a fetchable resource
   * @param {object} options fetch options
   * @returns Promise
   */
  ffetch = async (resource, options = {}) => {
    if (isFolioApiRequest(resource, this.okapi.url)) {
      let response;
      // a fetch() resource can be either a string (which can be copied)
      // or a Request object (which can only be consumed once, and needs
      // to be cloned before it is used the first time in case this fetch
      // triggers rotation and it needs to be replayed.
      const reusableResource = resource instanceof Request || resource instanceof URL ? resource.clone() : resource;

      // readers/writer lock pattern: don't fetch while rotation is in-progress
      // https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
      response = await navigator.locks.request(RTR_LOCK_KEY, { mode: 'shared' }, async () => {
        const fr = await this.nativeFetch.apply(globalThis, [resource, options && { ...options, ...FOLIO_FETCH_OPTIONS }]);
        return fr;
      });

      if (options?.rtrIgnore) {
        return response;
      }

      if (!response?.ok) {
        response = await rotateAndReplay(
          this.nativeFetch,
          { ...this.rotationConfig, logger: this.logger },
          { response, resource: reusableResource, options }
        );
      }

      return response;
    }

    // default: pass requests through to the network
    return this.nativeFetch.apply(globalThis, [resource, options]);
  };
}
