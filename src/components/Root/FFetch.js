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

import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import {
  setRtrTimeout,
  setRtrFlsTimeout,
  setRtrFlsWarningTimeout,
} from '../../okapiActions';

import { getTokenExpiry } from '../../loginServices';
import {
  getPromise,
  isAuthenticationRequest,
  isFolioApiRequest,
  isLogoutRequest,
  isValidSessionCheckRequest,
  rtr,
} from './token-util';
import {
  RTRError,
} from './Errors';
import {
  RTR_AT_EXPIRY_IF_UNKNOWN,
  RTR_AT_TTL_FRACTION,
  RTR_ERROR_EVENT,
  RTR_FLS_TIMEOUT_EVENT,
  RTR_TIME_MARGIN_IN_MS,
  RTR_FLS_WARNING_EVENT,
  RTR_RT_EXPIRY_IF_UNKNOWN,
  SESSION_ACTIVE_WINDOW_ID,
  RTR_ACTIVE_WINDOW_MSG,
  RTR_ACTIVE_WINDOW_MSG_CHANNEL
} from './constants';
import FXHR from './FXHR';



const OKAPI_FETCH_OPTIONS = {
  credentials: 'include',
  mode: 'cors',
};

const RTR_LOCK_KEY = '@folio/stripes-core::RTR_LOCK_KEY';

/**
 * queueRotateReplay
 * 1. queue the original request
 * 2. rotate tokens
 * 3. replay the original request now that tokens are fresh
 *
 * @param {*} fetchfx fetch function to execute
 * @param {*} config rotation configuration
 * @param {*} error failed request { response, resource, options }
 *
 * @returns response of the replayed request
 */
const queueRotateReplay = async (fetchfx, config, error) => {
  console.log('rtr', 'queueRotateReplay...');

  const replayQueuedRequest = async () => {
    console.log('rtr', 'replaying ...', error.resource);
    const response = await fetchfx.apply(global, [error.resource, config.options(error.options)]);
    return response;
  };

  /**
   * rotateTokens
   * 1. getTokens: maybe another request has already rotated
   * 2. rotate: race the rotation request with a rejecting timeout
   * 3. callback: store updated token details
   * 4. replay: replay the original request
   *
   * @returns promise response from the original request
   */
  const rotateTokens = async () => {
    console.log('rtr', 'locked ...');
    try {
      //
      // 1. if rotation completed elsewhere, we don't need to rotate!
      // maybe another tab rotated, maybe it happened while awaiting the lock.
      if (await config.isValidToken()) {
        console.log('rtr', 'reusing token supplied by another request');
        return replayQueuedRequest();
      }

      //
      // 2. rotate: race the rotation-request with a timeout; default 30s
      const refreshTimeout = new Promise((_res, rej) => {
        const timeout = config.refreshTimeout || ms('30s');
        setTimeout(() => {
          rej(new Error(`Token refresh timed out after ${ms(timeout)}`));
        }, timeout);
      });

      console.log('===> rotating ...');
      const t = await Promise.race([
        refreshTimeout,
        config.rotate()
      ]);
      console.log('<=== rotated!');

      //
      // 3. callback
      config.onSuccess(t);
      console.log('rtr', 'rotated ...');

      //
      // 4. replay the original request
      return replayQueuedRequest();
    } catch (err) {
      console.error('caught an RTR error!', err);
      config.onFailure(err);

      // return the original response
      return Promise.reject(error);
    }
  };

  // rotation config
  const shouldRotate = config.shouldRotate ?? (() => Promise.resolve(true));
  const statusCodes = config.statusCodes || [401];

  // skip rotation if:
  // 1. we don't have a failed response to work with
  // 2. the response status code does not indicate an authn failure
  // 3. the original request asked to ignore rtr
  // 4. we were asked not to rotate
  if (
    !error.response ||
    !statusCodes.includes(error.response.status) ||
    error.options?.rtrIgnore ||
    !await shouldRotate()
  ) {
    return Promise.reject(error);
  }

  // pause users requests, giving us time to complete RTR in another window,
  // proving that when simulateous requests fire, they correctly lock each
  // other out, and when the second returns, it reuses the token from the first
  // if (error.resource.match(/users/)) {
  //   console.log('===> users waiting')
  //   await new Promise((res, rej) => {
  //     setTimeout(res, 5000);
  //   });
  //   console.log('<=== users waited')
  // }

  // lock, then rotate
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(RTR_LOCK_KEY, rotateTokens);
  } else {
    return rotateTokens();
  }
};


export class FFetch {
  constructor({ logger, store, rtrConfig, okapi }) {
    this.logger = logger;
    this.store = store;
    this.rtrConfig = rtrConfig;
    this.okapi = okapi;
    this.focusEventSet = false;
    this.rtrScheduled = false; // Track if RTR has been scheduled in this tab
    this.bc = new BroadcastChannel(RTR_ACTIVE_WINDOW_MSG_CHANNEL);
    // this.setWindowIdMessageEvent();
    // this.setDocumentFocusHandler();
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
    logger: this.logger,

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
            accessToken: new Date(json.accessTokenExpiration).getTime(),
            refreshToken: new Date(json.refreshTokenExpiration).getTime(),
          };
        }
      }

      throw new Error('Rotation failure!');
    },

    // return true if a valid token is available
    isValidToken: () => {
      try {
        const { accessToken } = JSON.parse(localStorage.getItem(RTR_LOCK_KEY));
        return accessToken > Date.now();
      } catch (err) {
        console.error({ err });
      }
      console.log('no token, or it is not valid');
      return false;
    },

    // store token on success; void
    onSuccess: (newTokens) => {
      localStorage.setItem(RTR_LOCK_KEY, JSON.stringify(newTokens));
      console.log({ newTokens });
    },

    // what to do, what to do; void
    onFailure: (error) => {
      console.error('Session expired', error);
      // window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: error }));
      window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: 'Session expired' }));
    },
  };

  ffetch = async (resource, options = {}) => {
    try {
      console.log(`fetching ${resource}`);
      let response = await this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);

      if (!response?.ok) {
        response = await queueRotateReplay(this.nativeFetch, this.rotationConfig, { response, resource, options });
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
