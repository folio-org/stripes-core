import { isEmpty } from 'lodash';
import ms from 'ms';

import { UnexpectedResourceError } from './Errors';
import {
  RTR_ACTIVITY_EVENTS,
  RTR_FLS_WARNING_TTL,
  RTR_IDLE_MODAL_TTL,
  RTR_IDLE_SESSION_TTL,
  RTR_TIME_MARGIN_IN_MS,
} from './constants';

/**
 * resourceMapper
 * Given a resource that represent a URL in some form (a string
 * such as "https://barbenheimer-for-best-picture.com" or a URL object
 * or a Request object), and a function that expects a string, extract
 * the URL as a string and pass it to the function. Throw if the
 * resource doesn't represent a known type.
 *
 * @param {string|URL|Request} resource
 * @param {*} fx function to call
 * @returns result of fx()
 * @throws UnexpectedResourceError if resource is not a string, URL, or Request
 */
export const resourceMapper = (resource, fx) => {
  if (typeof resource === 'string') {
    return fx(resource);
  } else if (resource instanceof URL) {
    return fx(resource.origin);
  } else if (resource instanceof Request) {
    return fx(resource.url);
  }

  throw new UnexpectedResourceError(resource);
};

/**
 * isFolioApiRequest
 * Return true if the resource origin matches FOLIO's API origin, i.e. if
 * this is a request that needs to include a valid AT.
 *
 * @param {*} resource one of string, URL, request
 * @param {string} oUrl FOLIO API origin
 * @returns boolean
 */
export const isFolioApiRequest = (resource, oUrl) => {
  const isFolioApiResource = (string) => {
    return string.startsWith(oUrl);
  };

  try {
    return resourceMapper(resource, isFolioApiResource);
  } catch (rme) {
    if (rme instanceof UnexpectedResourceError) {
      console.warn(rme.message, resource); // eslint-disable-line no-console
      return false;
    }

    throw rme;
  }
};

/**
 * configureRtr
 * Provide default values necessary for RTR. They may be overriden by setting
 * config.rtr... in stripes.config.js.
 *
 * @param {object} config
 */
export const configureRtr = (config = {}) => {
  const conf = { ...config };

  // how long does an idle session last before being killed?
  if (!conf.idleSessionTTL) {
    conf.idleSessionTTL = RTR_IDLE_SESSION_TTL;
  }

  // how long is the "warning, session is idle!" modal shown
  // before the session is killed?
  if (!conf.idleModalTTL) {
    conf.idleModalTTL = RTR_IDLE_MODAL_TTL;
  }

  // what events constitute activity?
  if (isEmpty(conf.activityEvents)) {
    conf.activityEvents = RTR_ACTIVITY_EVENTS;
  }

  // how long is the "your session is gonna die!" warning shown
  // before the session is, in fact, killed?
  if (!conf.fixedLengthSessionWarningTTL) {
    conf.fixedLengthSessionWarningTTL = RTR_FLS_WARNING_TTL;
  }

  return conf;
};

/**
 * rotationHandler
 * Construct a function to call on rotation: it accepts the new expiration data,
 * stores it, and then resets the end-of-session and end-of-session-warning
 * timers.
 *
 * Subtracting RTR_TIME_MARGIN_IN_MS from the end of the timer shortens those
 * windows slightly in order to give the session time to shut down. Without
 * this margin, the timer will ping exactly as the cookie expires, which means
 * the /logout API request is guaranteed to fail.
 *
 * @param {async function} handleSaveTokens persist new token-expiration data
 * @param {ResetTimer} sessionTimeoutTimer your-session-is-ending timer
 * @param {ResetTimer} sessionTimeoutWarningTimer warning, your-session-is-ending timer
 * @param {object} rtrConfig shaped like { fixedLengthSessionWarningTTL}, which
 *   describes when to ping sessionTimeoutWarningTimer.
 *
 * @returns async function suitable as a callback on successful rotation
 */
export const rotationHandler = (handleSaveTokens, timeoutTimer, warningTimer, rtrConfig) => {
  return async (expiry) => {
    const atExpires = new Date(expiry.accessTokenExpiration).getTime();
    const rtExpires = new Date(expiry.refreshTokenExpiration).getTime();
    await handleSaveTokens({ atExpires, rtExpires });

    const rtTimeoutInterval = rtExpires - Date.now();
    timeoutTimer.reset(rtTimeoutInterval - RTR_TIME_MARGIN_IN_MS);

    const rtWarningInterval = rtTimeoutInterval - ms(rtrConfig.fixedLengthSessionWarningTTL);
    warningTimer.reset(rtWarningInterval - RTR_TIME_MARGIN_IN_MS);
  };
};

/**
 * ResetTimer
 * A resettable timer. On reset, it cancels the existing timer and sets a new
 * one. This is useful when an RT is implemented as a sliding window. After
 * each rotation, the old end-of-session timer needs to be cancelled and a
 * new one configured.
 *
 * It accepts a callback in the constructor. The reset function accepts an
 * interval in milliseconds, or a string parseable by ms.
 *
 * @param {*} callback function to call when the timer pings
 * @param {*} logger logs on the rtr channel
 * @throws TypeError on any unexpected/unparseable argument
 * @returns  { reset(interval), cancel() }
 */
export class ResetTimer {
  #id = null; // id of the timer
  #callback = null; // function to execute when timer pings
  #logger = null;

  constructor(callback, logger) {
    if (typeof callback !== 'function') throw new TypeError('Expected `callback` to be a function');

    this.#callback = callback;
    if (logger) {
      this.#logger = logger;
    }
  }

  reset = (interval) => {
    const timeout = (typeof interval === 'string') ? ms(interval) : interval;
    if (typeof timeout !== 'number') throw new TypeError('Expected `interval` to be a number');

    if (this.#id) {
      this.#logger.log('rtr', `ResetTimer: cancelling ${this.#id}`);
    }

    clearTimeout(this.#id);
    this.#id = setTimeout(this.#callback, timeout);
    this.#logger.log(`ResetTimer: setting ${this.#id}`);
  };

  cancel = () => {
    this.#logger.log('rtr', `ResetTimer: cancelling ${this.#id}`);
    clearTimeout(this.#id);
    this.#id = null;
  };
}
