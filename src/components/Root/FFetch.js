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

import { getTokenExpiry, setTokenExpiry } from '../../loginServices';
import {
  isFolioApiRequest,
  isLogoutRequest,
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
  constructor({ logger, store, okapi, onRotate }) {
    this.logger = logger;
    this.store = store;
    this.okapi = okapi;
    this.focusEventSet = false;
    this.rtrScheduled = false; // Track if RTR has been scheduled in this tab
    // this.bc = new BroadcastChannel(RTR_ACTIVE_WINDOW_MSG_CHANNEL);
    // this.setWindowIdMessageEvent();
    // this.setDocumentFocusHandler();
    this.onRotate = onRotate;
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

  rotationConfig = {
    // statuscodes to intercept
    // optional; defaults to 401
    statusCodes: [400, 401],

    // this doesn't work. binding weirdness?
    // logger: this.logger,

    // timeout in milliseconds
    // optional; defaults to 30s
    // refreshTimeout: ms('30s'),

    // fetch options
    // configure request options with the token attached, headers munged, etc
    options: (options = {}) => {
      return { ...options, ...OKAPI_FETCH_OPTIONS };
    },

    // alternative to status code inspection? ugh, have to read the body :(
    // shouldRefresh: async (response) => {
    //   const cr = response.clone();
    //   const text = await cr.text();
    //   return response.status === 400 && text.startsWith('Token missing, access requires permission');
    // },

    // handle rotation
    rotate: async () => {
      const res = await this.nativeFetch.apply(global, [`${this.okapi.url}/authn/refresh`, {
        headers: {
          'content-type': 'application/json',
          'x-okapi-tenant': this.okapi.tenant,
        },
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      }]);

      // so we can test the promise race
      // await new Promise((res, rej) => {
      //   setTimeout(res, ms('5s'))
      // });

      if (res.ok) {
        const json = await res.json();
        if (json.accessTokenExpiration && json.refreshTokenExpiration) {
          return {
            accessTokenExpiration: json.accessTokenExpiration,
            refreshTokenExpiration: json.refreshTokenExpiration,
          };
        }
      }

      throw new Error('Rotation failure!');
    },

    // return true if a valid token is available
    isValidToken: async () => {
      try {
        const expiry = await getTokenExpiry();
        console.log(`isValidToken ? ${expiry?.atExpires} > ${Date.now()} ? ${!!(expiry?.atExpires > Date.now())}`)
        return !!(expiry?.atExpires > Date.now());
      } catch (err) {
        console.error({ err });
      }
      console.log('no token, or it is not valid');
      return false;
    },

    // store token on success; void
    onSuccess: async (newTokens) => {
      await this.onRotate(newTokens);
    },

    // what to do, what to do; void
    onFailure: async (error) => {
      console.error('Session expired', error);
      // window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: error }));
      window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: 'Session expired' }));
    },
  };

  ffetch = async (resource, options = {}) => {
    try {
      console.log(`fetching ${resource}`);

      // readers/writer lock pattern: don't fetch while rotation is in-progress
      // https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
      let response = await navigator.locks.request(RTR_LOCK_KEY, { mode: 'shared' }, async () => {
        const fr = await this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
        return fr;
      });

      if (!response?.ok) {
        console.log({ logger: this.logger })
        response = await rotateAndReplay(
          this.nativeFetch,
          { ...this.rotationConfig, logger: this.logger },
          { response, resource, options });
      }

      return response;
    } catch (err) {
      console.log({ err });
      if (err.response) {
        return err.response;
      }
      // oh we're in a baaaad state; fetch failed, and rotation failed and
      // did not return the original failed response!?!
      throw new Error('sad panda');
    }
  };
}
