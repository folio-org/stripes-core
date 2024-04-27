import { okapi } from 'stripes-config';

import { setTokenExpiry } from '../../loginServices';
import { RTRError, UnexpectedResourceError } from './Errors';
import { RTR_ERROR_EVENT, RTR_SUCCESS_EVENT } from './constants';

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
 * @returns boolean
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

/**
 * adjustTokenExpiration
 * Set the AT and RT token expirations to the fraction of their TTL given by
 * RTR_TTL_WINDOW. e.g. if a token should be valid for 100 more seconds and
 * RTR_TTL_WINDOW is 0.8, set to the expiration time to 80 seconds from now.
 *
 * @param {object} value { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 * @param {number} fraction float in the range (0..1]
 * @returns { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 */
export const adjustTokenExpiration = (value, fraction) => ({
  atExpires: Date.now() + ((value.tokenExpiration.atExpires - Date.now()) * fraction),
  rtExpires: Date.now() + ((value.tokenExpiration.rtExpires - Date.now()) * fraction),
});

/**
 * shouldRotate
 * Return true if we should start a new rotation request, false if a request is
 * already pending.
 *
 * When RTR begins, the current time in milliseconds (i.e. Date.now()) is
 * cached in localStorage and the existence of that value is used as a flag
 * in subsequent requests to indicate that they should wait for that request
 * rather then firing a new one. If that flag isn't properly cleared when the
 * RTR request completes, it will block future RTR requests since it will
 * appear that a request is already in-progress. Thus, instead of merely
 * checking for the presence of the flag, this function ALSO checks the age
 * of that flag. If the flag is older than RTR_MAX_AGE it is considered
 * stale, indicating a new request should begin.
 *
 * @param {@folio/stripes/logger} logger
 * @returns boolean
 */
export const shouldRotate = (logger) => {
  const rotationTimestamp = localStorage.getItem(RTR_IS_ROTATING);
  if (rotationTimestamp) {
    if (Date.now() - rotationTimestamp < RTR_MAX_AGE) {
      return false;
    }
    logger.log('rtr', 'rotation request is stale');
  }

  return true;
};

/**
 * rtr
 * exchange an RT for a new one.
 * Make a POST request to /authn/refresh, including the current credentials,
 * and send a TOKEN_EXPIRATION event to clients that includes the new AT/RT
 * expiration timestamps.
 *
 * Since all windows share the same cookie, this means the must also share
 * rotation, and when rotation starts in one window requests in all others
 * must await the same promise. Thus, the RTR_IS_ROTATING flag is stored via
 * localStorage where it is globally accessible, rather than in a local
 * variable (which would only be available in the scope of a single window).
 *
 * The basic plot is for this function to return a promise that resolves when
 * rotation is finished. If rotation hasn't started, that's the rotation
 * promise itself (with some other business chained on). If rotation has
 * started, it's a promise that resolves when it receives a "rotation complete"
 * event (part of that other business).
 *
 * The other business consists of:
 * 1 unsetting the isRotating flag in localstorage
 * 2 capturing the new expiration data, shrinking its TTL window, calling
 *   setTokenExpiry to push the new values to localstorage, and caching it
 *   on the calling context.
 * 3 dispatch RTR_SUCCESS_EVENT
 *
 * // ff fetch function
 * // logger
 * // callback
 *
 * @returns Promise
 * @throws if RTR fails
 */
export const rtr = (context, callback) => {
  context.logger.log('rtr', '** RTR ...');

  // somebody else already started rotation; nothing to do here
  if (!shouldRotate(context.logger)) {
    context.logger.log('rtr', '** already in progress; exiting');
    return;
  }

  context.logger.log('rtr', '**     rotation beginning...');

  localStorage.setItem(RTR_IS_ROTATING, `${Date.now()}`);
  context.nativeFetch.apply(global, [`${okapi.url}/authn/refresh`, {
    headers: {
      'content-type': 'application/json',
      'x-okapi-tenant': okapi.tenant,
    },
    method: 'POST',
    credentials: 'include',
    mode: 'cors',
  }])
    .then(res => {
      // if (res.ok) {
      //   return res.json();
      // }
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
      context.logger.log('rtr', '**     success!');
      callback(json);
      const te = {
        atExpires: new Date(json.accessTokenExpiration).getTime(),
        rtExpires: new Date(json.refreshTokenExpiration).getTime(),
      };
      context.tokenExpiration = te;
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
 * isRotating
 * Return true if a rotation-request is pending; false otherwise.
 * A pending rotation-request that is older than RTR_MAX_AGE is
 * considered stale and ignored.
 * @param {*} logger
 * @returns boolean
 */
const isRotating = (logger) => {
  const rotationTimestamp = localStorage.getItem(RTR_IS_ROTATING);
  if (rotationTimestamp) {
    if (Date.now() - rotationTimestamp < RTR_MAX_AGE) {
      return true;
    }
    logger.log('rtr', 'rotation request is stale');
  }

  return false;
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
  return isRotating(logger) ? rotationPromise(logger) : Promise.resolve();
};
