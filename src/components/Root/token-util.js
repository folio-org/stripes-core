import localForage from 'localforage';
import { okapi } from 'stripes-config';
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
const TTL_WINDOW = 0.8;

/** how many times to check the lock before giving up */
const IS_ROTATING_RETRIES = 100;

/** how long to wait before rechecking the lock, in milliseconds (100 * 100) === 10 seconds */
const IS_ROTATING_INTERVAL = 100;

export const getTokenSess = async () => {
  return localForage.getItem('okapiSess');
};

export const getTokenExpiry = async () => {
  const sess = await getTokenSess();
  return new Promise((resolve) => resolve(sess?.tokenExpiration));
};

export const setTokenExpiry = async (te) => {
  const sess = await getTokenSess();
  return localForage.setItem('okapiSess', { ...sess, tokenExpiration: te });
};

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
 * adjustTokenExpiration
 * Set the AT and RT token expirations to the fraction of their TTL given by
 * TTL_WINDOW. e.g. if a token should be valid for 100 more seconds and TTL_WINDOW
 * is 0.8, set to the expiration time to 80 seconds from now.
 *
 * @param {object} value { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 * @returns { tokenExpiration: { atExpires, rtExpires }} both are millisecond timestamps
 */
export const adjustTokenExpiration = (value) => ({
  atExpires: Date.now() + ((value.tokenExpiration.atExpires - Date.now()) * TTL_WINDOW),
  rtExpires: Date.now() + ((value.tokenExpiration.rtExpires - Date.now()) * TTL_WINDOW),
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

  // if several fetches trigger rtr in a short window, all but the first will
  // fail because the RT will be stale after the first request rotates it.
  // the sentinel isRotating indicates that rtr has already started and therefore
  // should not start again; instead, we just need to wait until it finishes.
  // waiting happens in a for-loop that waits a few milliseconds and then rechecks
  // isRotating. hopefully, that process goes smoothly, but we'll give up after
  // IS_ROTATING_RETRIES * IS_ROTATING_INTERVAL milliseconds and return failure.
  if (context.isRotating) {
    for (let i = 0; i < IS_ROTATING_RETRIES; i++) {
      context.logger.log('rtr', `**    is rotating; waiting ${IS_ROTATING_INTERVAL}ms`);
      await new Promise(resolve => setTimeout(resolve, IS_ROTATING_INTERVAL));
      if (!context.isRotating) {
        return Promise.resolve();
      }
    }
    // all is lost
    return Promise.reject(new Error('in-process RTR timed out'));
  }

  context.isRotating = true;
  return context.ogFetch.apply(global, [`${okapi.url}/authn/refresh`, {
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
          this.isRotating = false;
          if (Array.isArray(json.errors) && json.errors[0]) {
            throw new RTRError(`${json.errors[0].message} (${json.errors[0].code})`);
          } else {
            throw new RTRError('RTR response failure');
          }
        });
    })
    .then(json => {
      context.logger.log('rtr', '**     success!');
      context.isRotating = false;
      return adjustTokenExpiration({
        tokenExpiration: {
          atExpires: new Date(json.accessTokenExpiration).getTime(),
          rtExpires: new Date(json.refreshTokenExpiration).getTime(),
        }
      });
    })
    .then(te => {
      // @@dispatchEvent(RTR rotation event)
      context.tokenExpiration = te;
      return setTokenExpiry(te);
    });
};
