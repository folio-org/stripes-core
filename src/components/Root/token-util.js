import { isEmpty } from 'lodash';
import { okapi } from 'stripes-config';

import { getTokenExpiry, setTokenExpiry } from '../../loginServices';
import { RTRError, UnexpectedResourceError } from './Errors';
import {
  RTR_ACTIVITY_EVENTS,
  RTR_AT_TTL_FRACTION,
  RTR_ERROR_EVENT,
  RTR_IDLE_MODAL_TTL,
  RTR_IDLE_SESSION_TTL,
  RTR_SUCCESS_EVENT,
} from './constants';

/** localstorage flag indicating whether an RTR request is already under way. */
export const RTR_IS_ROTATING = '@folio/stripes/core::rtrIsRotating';

/**
 * RTR_MAX_AGE (int)
 * How long do we let a refresh request last before we consider it stale?
 *
 * When RTR begins, the current time in milliseconds (i.e. Date.now()) is
 * cached in localStorage and the existence of that value is used as a flag
 * in subsequent requests to indicate that they just need to wait for the
 * existing RTR request to complete rather than starting another RTR request
 * (which would fail due to reusing the same RT). The flag is cleared in a
 * `finally` clause, so it should _always_ get cleared, but closing a window
 * mid-rotation allows the flag to get stuck. If the flag is present but no
 * rotation request is actually in progress, rotation will never happen.
 *
 * Thus this value, a time (in milliseconds) representing the max-age of an
 * rtr request before it is considered stale/ignorable.
 *
 * Time in milliseconds
 */
export const RTR_MAX_AGE = 2000;

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
 * isAuthenticationRequest
 * Return true if the given resource is an authentication request,
 * i.e. a request that should kick off the RTR cycle.
 *
 * @param {*} resource one of string, URL, Request
 * @param {string} oUrl FOLIO API origin
 * @returns boolean
 */
export const isAuthenticationRequest = (resource, oUrl) => {
  const isPermissibleResource = (string) => {
    const permissible = [
      '/bl-users/login-with-expiry',
      '/bl-users/_self',
    ];

    return !!permissible.find(i => string.startsWith(`${oUrl}${i}`));
  };

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
 * isLogoutRequest
 * Return true if the given resource is a logout request; false otherwise.
 *
 * @param {*} resource one of string, URL, Request
 * @param {string} oUrl FOLIO API origin
 * @returns boolean
 */
export const isLogoutRequest = (resource, oUrl) => {
  const permissible = [
    '/authn/logout',
  ];

  const isLogoutResource = (string) => {
    return !!permissible.find(i => string.startsWith(`${oUrl}${i}`));
  };

  try {
    return resourceMapper(resource, isLogoutResource);
  } catch (rme) {
    if (rme instanceof UnexpectedResourceError) {
      console.warn(rme.message, resource); // eslint-disable-line no-console
      return false;
    }

    throw rme;
  }
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
 * isRotating
 * Return true if a rotation-request is pending; false otherwise.
 * A pending rotation-request that is older than RTR_MAX_AGE is
 * considered stale and ignored.
 * @param {*} logger
 * @returns boolean
 */
export const isRotating = () => {
  const rotationTimestamp = localStorage.getItem(RTR_IS_ROTATING);
  if (rotationTimestamp) {
    if (Date.now() - rotationTimestamp < RTR_MAX_AGE) {
      return true;
    }
    console.warn('rotation request is stale'); // eslint-disable-line no-console
    localStorage.removeItem(RTR_IS_ROTATING);
  }

  return false;
};

/**
 * rtr
 * exchange an RT for new tokens; dispatch RTR_ERROR_EVENT on error.
 *
 * Since all windows share the same cookie, this means the must also share
 * rotation, and when rotation starts in one window requests in all others
 * must await that promise. Thus, the RTR_IS_ROTATING flag is stored via
 * localStorage where it is globally accessible, rather than in a local
 * variable (which would only be available in the scope of a single window).
 *
 * The basic plot is for this function to return a promise that resolves when
 * rotation is finished. If rotation hasn't started, that's the rotation
 * promise itself (with some other business chained on). If rotation has
 * started, it's a promise that auto-resolves after RTR_MAX_AGEms have elapsed.
 * That
 *
 * The other business consists of:
 * 1 unsetting the isRotating flag in localstorage
 * 2 capturing the new expiration data and storing it
 * 3 dispatch RTR_SUCCESS_EVENT
 *
 * @param {function} fetchfx native fetch function
 * @param {@folio/stripes/logger} logger
 * @param {function} callback
 * @returns void
 */
export const rtr = (fetchfx, logger, callback) => {
  logger.log('rtr', '** RTR ...');

  // rotation is already in progress, maybe in this window,
  // maybe in another: wait until RTR_MAX_AGE has elapsed,
  // which means the RTR request will either be finished or
  // stale, then continue
  if (isRotating()) {
    logger.log('rtr', '** already in progress; exiting');
    return new Promise(res => setTimeout(res, RTR_MAX_AGE))
      .then(() => {
        if (!isRotating()) {
          logger.log('rtr', '**     success after waiting!');
          getTokenExpiry().then((te) => {
            callback(te);
            window.dispatchEvent(new Event(RTR_SUCCESS_EVENT));
          });
        }
      });
  }

  logger.log('rtr', '**     rotation beginning...');

  localStorage.setItem(RTR_IS_ROTATING, `${Date.now()}`);
  return fetchfx.apply(global, [`${okapi.url}/authn/refresh`, {
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
          localStorage.removeItem(RTR_IS_ROTATING);
          if (Array.isArray(json.errors) && json.errors[0]) {
            throw new RTRError(`${json.errors[0].message} (${json.errors[0].code})`);
          } else {
            throw new RTRError('RTR response failure');
          }
        });
    })
    .then(json => {
      logger.log('rtr', '**     success!');
      callback(json);
      const te = {
        atExpires: new Date(json.accessTokenExpiration).getTime(),
        rtExpires: new Date(json.refreshTokenExpiration).getTime(),
      };
      setTokenExpiry(te);
      window.dispatchEvent(new Event(RTR_SUCCESS_EVENT));
    })
    .catch((err) => {
      console.error('RTR_ERROR_EVENT', err); // eslint-disable-line no-console
      window.dispatchEvent(new Event(RTR_ERROR_EVENT));
    })
    .finally(() => {
      localStorage.removeItem(RTR_IS_ROTATING);
    });
};



/**
 * rotationPromise
 * Return a promise that will resolve when the active rotation request
 * completes and (a) issues a storage event that removes the RTR_IS_ROTATING
 * value and (b) issues an RTR_SUCCESS_EVENT. The promise itself sets up the
 * listeners for these events, and then removes them when it resolves.
 *
 * @param {*} logger
 * @returns Promise
 */
const rotationPromise = async (logger) => {
  logger.log('rtr', 'rotation pending!');
  return new Promise((res) => {
    const rotationHandler = () => {
      if (localStorage.getItem(RTR_IS_ROTATING) === null) {
        window.removeEventListener(RTR_SUCCESS_EVENT, rotationHandler);
        window.removeEventListener('storage', rotationHandler);
        logger.log('rtr', 'rotation resolved');
        res();
      }
    };
    // same window: listen for custom event
    window.addEventListener(RTR_SUCCESS_EVENT, rotationHandler);

    // other windows: listen for storage event
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
    // "This [is] a way for other pages on the domain using the storage
    // to sync any changes that are made."
    window.addEventListener('storage', rotationHandler);
  });
};

export const getPromise = async (logger) => {
  return isRotating() ? rotationPromise(logger) : Promise.resolve();
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

  // what fraction of the way through the session should we rotate?
  if (!conf.rotationIntervalFraction) {
    conf.rotationIntervalFraction = RTR_AT_TTL_FRACTION;
  }

  // what events constitute activity?
  if (isEmpty(conf.activityEvents)) {
    conf.activityEvents = RTR_ACTIVITY_EVENTS;
  }

  return conf;
};
