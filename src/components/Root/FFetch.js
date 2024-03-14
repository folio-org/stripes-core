/* eslint-disable import/prefer-default-export */

/**
 * TLDR: override global `fetch` and `XMLHttpRequest` to perform RTR for FOLIO API requests.
 *
 * RTR Primers:
 * @see https://authjs.dev/guides/basics/refresh-token-rotation
 * @see https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
 *
 * Our AT and RT live in HTTP-only cookies, so the JS code doesn't have access
 * to them. The AT cookie accompanies every request, and the RT cookie is sent
 * only in refresh requests.
 *
 * The basic workflow here is intercept requests for FOLIO APIs and trap
 * response failures that are caused by expired ATs, conduct RTR, then replay
 * the original requests. FOLIO API requests that arrive while RTR is in-process
 * are held until RTR finishes and then allowed to flow through. AT failure is
 * recognized in a response with status code 403 and an error message beginning with
 * "Token missing". (Eventually, it may be 401 instead, but not today.) Requests
 * to non-FOLIO APIs flow through without intervention.
 *
 * RTR failures should cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests.
 *
 * The gross gory details:
 * In an ideal world, we would simply export a function and a class and
 * tell folks to use those, but we don't live in that world, at least not
 * yet. So. For now, we override the global implementations in the constructor
 * :scream: so any calls directly invoking `fetch()` or instantiating
 * `XMLHttpRequest` get these updated versions that handle token rotation
 * automatically.
 *
 */

import { okapi } from 'stripes-config';
import { getTokenExpiry } from '../../loginServices';
import {
  isFolioApiRequest,
  isLogoutRequest,
  isValidAT,
  isValidRT,
  resourceMapper,
  rtr,
} from './token-util';
import {
  RTRError,
  UnexpectedResourceError,
} from './Errors';
import {
  RTR_ERROR_EVENT,
} from './Events';

import FXHR from './FXHR';

const OKAPI_FETCH_OPTIONS = {
  credentials: 'include',
  mode: 'cors',
};

export class FFetch {
  constructor({ logger }) {
    this.logger = logger;

    // save a reference to fetch, and then reassign the global :scream:
    this.nativeFetch = global.fetch;
    global.fetch = this.ffetch;

    this.NativeXHR = global.XMLHttpRequest;
    global.XMLHttpRequest = FXHR(this);
  }

  /** { atExpires, rtExpires } both are JS millisecond timestamps */
  tokenExpiration = null;

  /** lock to indicate whether a rotation request is already in progress */
  // @@ needs to be stored in localforage???
  isRotating = false;

  /**
   * isPermissibleRequest
   * Some requests are always permissible, e.g. auth-n and forgot-password.
   * Others are only permissible if the Access Token is still valid.
   *
   * @param {Request} req clone of the original event.request object
   * @param {object} te token expiration shaped like { atExpires, rtExpires }
   * @param {string} oUrl Okapi URL
   * @returns boolean true if the AT is valid or the request is always permissible
   */
  isPermissibleRequest = (resource, te, oUrl) => {
    if (isValidAT(te, this.logger)) {
      return true;
    }

    const isPermissibleResource = (string) => {
      const permissible = [
        '/bl-users/forgotten/password',
        '/bl-users/forgotten/username',
        '/bl-users/login-with-expiry',
        '/bl-users/password-reset',
        '/saml/check',
        `/_/invoke/tenant/${okapi.tenant}/saml/login`
      ];

      this.logger.log('rtr', `AT invalid for ${resource}`);
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
   * passThroughWithRT
   * Perform RTR then execute the original request.
   * If RTR fails, dispatch RTR_ERROR_EVENT and die softly.
   *
   * @param {*} resource one of string, URL, Request
   * @params {object} options
   * @returns Promise
   */
  passThroughWithRT = (resource, options) => {
    this.logger.log('rtr', 'pre-rtr-fetch', resource);
    return rtr(this)
      .then(() => {
        this.logger.log('rtr', 'post-rtr-fetch', resource);
        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
      })
      .catch(err => {
        if (err instanceof RTRError) {
          console.error('RTR failure', err); // eslint-disable-line no-console
          document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
          return Promise.resolve(new Response(JSON.stringify({})));
        }

        throw err;
      });
  };

  /**
   * passThroughWithAT
   * Given we believe the AT to be valid, pass the fetch through.
   * If it fails, maybe our beliefs were wrong, maybe everything is wrong,
   * maybe there is no God, or there are many gods, or god is a she, or
   * she is a he, or Lou Reed is god. Or maybe we were just wrong about the
   * AT and we need to conduct token rotation, so try that. If RTR succeeds,
   * it'll pass through the fetch as we originally intended because now we
   * know the AT will be valid. If RTR fails, then it doesn't matter about
   * Lou Reed. He may be god, but this is out of our hands now.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {*} options
   * @returns Promise
   */
  passThroughWithAT = (resource, options) => {
    return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
      .then(response => {
        // if the request failed due to a missing token, attempt RTR (which
        // will then replay the original fetch if it succeeds), or die softly
        // if it fails. return any other response as-is.
        if (response.status === 400 && response.headers.get('content-type') === 'text/plain') {
          const res = response.clone();
          return res.text()
            .then(text => {
              if (text.startsWith('Token missing')) {
                this.logger.log('rtr', '   (whoops, invalid AT; retrying)');
                return this.passThroughWithRT(resource, options);
              }

              // yes, we got a 4xx, but not an RTR 4xx. leave that to the
              // original application to handle. it's not our problem.
              return response;
            });
        }

        return response;
      });
  }

  /**
   * passThroughLogout
   * The logout request should never fail, even if it fails.
   * That is, if it fails, we just pretend like it never happened
   * instead of blowing up and causing somebody to get stuck in the
   * logout process.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   */
  passThroughLogout = (resource, options) => {
    this.logger.log('rtr', '   (logout request)');
    return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
      .catch(err => {
        // kill me softly: return an empty response to allow graceful failure
        console.error('-- (rtr-sw) logout failure', err); // eslint-disable-line no-console
        return Promise.resolve(new Response(JSON.stringify({})));
      });
  };

  /**
   * passThrough
   * Inspect resource to determine whether it's a FOLIO API request.
   * Handle it with RTR if it is; let it trickle through if not.
   *
   * Given we believe the AT to be valid, pass the fetch through.
   * If it fails, maybe our beliefs were wrong, maybe everything is wrong,
   * maybe there is no God, or there are many gods, or god is a she, or
   * she is a he, or Lou Reed is god. Or maybe we were just wrong about the
   * AT and we need to conduct token rotation, so try that. If RTR succeeds,
   * yay, pass through the fetch as we originally intended because now we
   * know the AT will be valid. If RTR fails, then it doesn't matter about
   * Lou Reed. He may be god. We'll dispatch an RTR_ERROR_EVENT and then
   * return a dummy promise, which gives the root-level (stripes-core level)
   * event handler the opportunity to respond (presumably by logging out)
   * without tripping up the application-level error handler which isn't
   * responsible for handling such things.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  ffetch = async (resource, ffOptions = {}) => {
    const { rtrIgnore = false, ...options } = ffOptions;

    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, okapi.url)) {
      this.logger.log('rtr', 'will fetch', resource);

      // logout requests must not fail
      if (isLogoutRequest(resource, okapi.url)) {
        return this.passThroughLogout(resource, options);
      }

      // if our cached tokens appear to have expired, pull them from storage.
      // maybe another window updated them for us without us knowing.
      if (!isValidAT(this.tokenExpiration, this.logger)) {
        this.logger.log('rtr', 'local tokens expired; fetching from storage');
        this.tokenExpiration = await getTokenExpiry();
      }

      // AT is valid or unnecessary; execute the fetch
      if (rtrIgnore || this.isPermissibleRequest(resource, this.tokenExpiration, okapi.url)) {
        return this.passThroughWithAT(resource, options);
      }

      // AT was expired, but RT is valid; perform RTR then execute the fetch
      if (isValidRT(this.tokenExpiration, this.logger)) {
        return this.passThroughWithRT(resource, options);
      }

      // AT is expired. RT is expired. It's the end of the world as we know it.
      // So, maybe Michael Stipe is god. Oh, wait, crap, he lost his religion.
      // Look, RTR is complicated, what do you want?
      console.error('All tokens expired'); // eslint-disable-line no-console
      document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: 'All tokens expired' }));
      return Promise.resolve(new Response(JSON.stringify({})));
    }

    // default: pass requests through to the network
    return Promise.resolve(this.nativeFetch.apply(global, [resource, options]));
  };
}
