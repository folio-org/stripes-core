import { okapi } from 'stripes-config';

import { setTokenExpiry } from '../../loginServices';
import { RTRError, UnexpectedResourceError } from './Errors';

/**
 * TTL_WINDOW
 * How much of a token's TTL can elapse before it is considered expired?
 * This helps us avoid a race-like condition where a token expires in the
 * gap between when we check whether we think it's expired and when we use
 * it to authorize a new request. Say the last RTR response took a long time
 * to arrive, so it was generated at 12:34:56 but we didn't process it until
 * 12:34:59. That could cause problems if (just totally hypothetically) we
 * had an application (again, TOTALLY hypothetically) that was polling every
 * five seconds and one of its requests landed in that three-second gap. Oh,
 * hey STCOR-754, what are you doing here?
 *
 * So this is a buffer. Instead of letting a token be used up until the very
 * last second of its life, we'll consider it expired a little early. This will
 * cause RTR to happen a little early (i.e. a little more frequently) but that
 * should be OK since it increases our confidence that when an AT accompanies
 * the RTR request it is still valid.
 *
 * Value is a float, 0 to 1, inclusive. Closer to 0 means more frequent
 * rotation; 1 means a token is valid up the very last moment of its TTL.
 * 0.8 is just a SWAG at a "likely to be useful" value. Given a 600 second
 * TTL (the current default for ATs) it corresponds to 480 seconds.
 */
export const TTL_WINDOW = 0.8;

/** how many times to check the lock before giving up */
export const IS_ROTATING_RETRIES = 100;

/** how long to wait before rechecking the lock, in milliseconds (100 * 100) === 10 seconds */
export const IS_ROTATING_INTERVAL = 100;


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
 * TTL_WINDOW. e.g. if a token should be valid for 100 more seconds and TTL_WINDOW
 * is 0.8, set to the expiration time to 80 seconds from now.
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
 * rtr
 * exchange an RT for a new one.
 * Make a POST request to /authn/refresh, including the current credentials,
 * and send a TOKEN_EXPIRATION event to clients that includes the new AT/RT
 * expiration timestamps.
 *
 * @returns Promise
 * @throws if RTR fails
 */
export const rtr = async (context) => {
  context.logger.log('rtr', '** RTR ...');

  const isRotating = localStorage.getItem('isRotating');
  if (isRotating === 'false' || isRotating === null) {
    localStorage.setItem('isRotating', 'true');
    context.rtrPromise = context.nativeFetch.apply(global, [`${okapi.url}/authn/refresh`, {
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
          localStorage.setItem('isRotating', 'false');
          return res.json();
        }
        // rtr failure. return an error message if we got one.
        return res.json()
          .then(json => {
            localStorage.setItem('isRotating', 'false');
            context.isRotating = false;
            if (Array.isArray(json.errors) && json.errors[0]) {
              throw new RTRError(`${json.errors[0].message} (${json.errors[0].code})`);
            } else {
              throw new RTRError('RTR response failure');
            }
          });
      })
      .then(json => {
        context.logger.log('rtr', '**     success!');
        const te = adjustTokenExpiration({
          tokenExpiration: {
            atExpires: new Date(json.accessTokenExpiration).getTime(),
            rtExpires: new Date(json.refreshTokenExpiration).getTime(),
          }
        }, TTL_WINDOW);
        context.tokenExpiration = te;
        return setTokenExpiry(te);
      })
      .finally(() => {
        // @@dispatchEvent(RTR rotation event)
        localStorage.setItem('isRotating', 'false');
      });
  } else {
    /* if `isRotating` is true in local storage, and context doesn't have
    * an rtrPromise already, we're possibly on a new tab.
    * In this case, we set up our own promise for this tab,
    * and listen for localStorage to update with `isRotating === false`
    * after that, we'll resolve our tab's rtr promise and be back to our
    * originally scheduled data fetching.
    */
    context.logger.log('rtr', 'rotation is already pending!');
    if (!context.rtrPromise) {
      context.rtrPromise = new Promise((res) => {
        context.logger.log('fingers crossed, waiting for first tab to resolve its RTR');
        const storageHandler = () => {
          if (localStorage.getItem('isRotating') === 'false') {
            window.removeEventListener('storage', storageHandler);
            context.logger.log('rtr', 'token rotation has resolved, continue as usual!');
            res();
          }
        };
        window.addEventListener('storage', storageHandler);
      });
    }
  }

  return context.rtrPromise;
};

