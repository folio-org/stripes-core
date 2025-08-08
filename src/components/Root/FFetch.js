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
 * The basic plot here is that RTR requests happen independently of other
 * activity. The login-response is used to trigger the RTR cycle, which then
 * continues in perpetuity until logout. Likewise, the response from each RTR
 * request is used to start the timer that will trigger the next round in the
 * cycle.
 *
 * Requests that arrive while RTR is in flight are held until the RTR promise
 * resolves and then processed. This avoids the problem of a request's AT
 * expiring (or changing, if RTR succeeds) while it is in-flight.
 *
 * RTR failures will cause logout since they indicate an expired or
 * otherwise invalid RT, which is unrecoverable. Other request failures
 * should be handled locally within the applications that initiated the
 * requests; thus, such errors are untrapped and bubble up.
 *
 * The gross gory details:
 * In an ideal world, we would simply export a function and a class and
 * tell folks to use those, but we don't live in that world, at least not
 * yet. So. For now, we override the global implementations in `replace...`
 * methods so any calls directly invoking `fetch()` or instantiating
 * `XMLHttpRequest` get these updated versions that handle token rotation
 * automatically.
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

export class FFetch {
  constructor({ logger, store, rtrConfig, okapi }) {
    this.logger = logger;
    this.store = store;
    this.rtrConfig = rtrConfig;
    this.okapi = okapi;
    this.focusEventSet = false;
    this.bc = new BroadcastChannel(RTR_ACTIVE_WINDOW_MSG_CHANNEL);
    this.setWindowIdMessageEvent();
    this.setDocumentFocusHandler();
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

  /**
   * onActiveWindowIdMessage
   * Handles receiving messages from other windows via the BroadcastChannel.
   * The broadcast windowId is stored in sessionStorage as SESSION_ACTIVE_WINDOW_ID.
   * and used in the rtr function (token-utils) to determine if rotation should proceed.
   */
  onActiveWindowIdMessage = ({ data }) => {
    if (data?.type === RTR_ACTIVE_WINDOW_MSG) {
      this.logger.log('rtr', `Message handler: Active window changed: ${data.activeWindow}`);
      sessionStorage.setItem(SESSION_ACTIVE_WINDOW_ID, data.activeWindow);
      // If the current window is not the active one, set focus handler to catch focus when it returns.
      if (!document.hasFocus()) {
        this.setDocumentFocusHandler();
      }
    }
  }

  /**
   * setWindowIdMessageEvent
   * Sets the window.windowId to a UUID if it doesn't already exist.
   * Also sets up a 'message' eventHandler to catch the current active windowId
   * when it's broadcast from another window.
   */
  setWindowIdMessageEvent = () => {
    window.stripesRTRWindowId = window.stripesRTRWindowId ? window.stripesRTRWindowId : uuidv4();
    this.bc.addEventListener('message', this.onActiveWindowIdMessage);
  }

  /**
   * Document Focus Handler
   * Posts a message to the BroadcastChannel with the current window's windowId.
   * Sets the SESSION_ACTIVE_WINDOW_ID in sessionStorage to the current window's windowId.
   * Sets the focusEventSet flag to false to allow setting a new focus handler.
   * @return {void}
   */
  documentFocusHandler = () => {
    this.logger.log('rtr', 'Focus handler - new window focused, broadcasting active window ID');
    this.bc.postMessage({ type: RTR_ACTIVE_WINDOW_MSG, activeWindow: window.stripesRTRWindowId });
    sessionStorage.setItem(SESSION_ACTIVE_WINDOW_ID, window.stripesRTRWindowId);
    this.focusEventSet = false;
  };

  /**
   * setDocumentFocusHandler
   * Sets up a document-level focus handler that will check if RTR is needed
   * and initiate it if the access token is expired.
   * The 'once' setting ensures that the handler removes itself after the first focus event.
   * To reduce chattiness, we only assign one of these handlers at a time, hence the `focusEventSet` flag.
  */
  setDocumentFocusHandler = () => {
    if (!this.focusEventSet) {
      this.focusEventSet = true;
      window.addEventListener('focusin', this.documentFocusHandler, { once: true });
    }
  }

  /**
   * scheduleRotation
   * Given a promise that resolves with timestamps for the AT's and RT's
   * expiration, configure relevant corresponding timers:
   * * before the AT expires, conduct RTR
   * * when the RT is about to expire, send a "session will end" event
   * * when the RT expires, send a "session ended" event"
   *
   * @param {Promise} rotationP
   */
  scheduleRotation = (rotationP) => {
    rotationP.then((rotationInterval) => {
      // AT refresh interval: a large fraction of the actual AT TTL
      const atInterval = (rotationInterval.accessTokenExpiration - Date.now()) * RTR_AT_TTL_FRACTION;

      // RT timeout interval (session will end) and warning interval (warning that session will end)
      const rtTimeoutInterval = (rotationInterval.refreshTokenExpiration - Date.now());
      const rtWarningInterval = (rotationInterval.refreshTokenExpiration - Date.now()) - ms(this.rtrConfig.fixedLengthSessionWarningTTL);

      // schedule AT rotation IFF the AT will expire before the RT. this avoids
      // refresh-thrashing near the end of the FLS with progressively shorter
      // AT TTL windows.
      if (rotationInterval.accessTokenExpiration < rotationInterval.refreshTokenExpiration) {
        this.logger.log('rtr', `rotation scheduled from rotateCallback; next callback in ${ms(atInterval)}`);
        this.store.dispatch(setRtrTimeout(setTimeout(() => {
          const { okapi } = this.store.getState();
          rtr(this.nativeFetch, this.logger, this.rotateCallback, okapi);
        }, atInterval)));
      } else {
        this.logger.log('rtr', 'rotation canceled; AT and RT will expire simultaneously');
      }

      // schedule FLS end-of-session warning
      this.logger.log('rtr-fls', `end-of-session warning at ${new Date(rotationInterval.refreshTokenExpiration - ms(this.rtrConfig.fixedLengthSessionWarningTTL))}`);
      this.store.dispatch(setRtrFlsWarningTimeout(setTimeout(() => {
        this.logger.log('rtr-fls', 'emitting RTR_FLS_WARNING_EVENT');
        window.dispatchEvent(new Event(RTR_FLS_WARNING_EVENT));
      }, rtWarningInterval)));

      // schedule FLS end-of-session logout
      this.logger.log('rtr-fls', `session will end at ${new Date(rotationInterval.refreshTokenExpiration)}`);
      this.store.dispatch(setRtrFlsTimeout(setTimeout(() => {
        this.logger.log('rtr-fls', 'emitting RTR_FLS_TIMEOUT_EVENT');
        window.dispatchEvent(new Event(RTR_FLS_TIMEOUT_EVENT));
      }, rtTimeoutInterval - RTR_TIME_MARGIN_IN_MS))); // Calling /logout a small margin before cookie is deleted to ensure it is included in the request
    });
  };

  /**
   * rotateCallback
   * Set a timeout to rotate the AT before it expires. Stash the timer-id
   * in redux so the setRtrTimeout action can be used to cancel the existing
   * timer when a new one is set.
   *
   * The rotation interval is set to a fraction of the AT's expiration
   * time, e.g. if the AT expires in 1000 seconds and the fraction is .8,
   * the timeout will be 800 seconds.
   *
   * @param {object} res object shaped like { accessTokenExpiration, refreshTokenExpiration }
   *   where the values are ISO-8601 datestamps like YYYY-MM-DDTHH:mm:ssZ
   */
  rotateCallback = (res) => {
    this.logger.log('rtr', 'rotation callback setup', res);

    // When starting a new session, the response from /bl-users/login-with-expiry
    // will contain token expiration info, but when restarting an existing session,
    // the response from /bl-users/_self will NOT, although that information should
    // have been cached in local-storage. Thus, we check the following places for
    // token expiration data:
    // 1. response
    // 2. session storage
    // 3. hard-coded default
    if (res?.accessTokenExpiration) {
      this.logger.log('rtr', 'rotation scheduled with login response data');
      const rotationPromise = Promise.resolve({
        accessTokenExpiration: new Date(res.accessTokenExpiration).getTime(),
        refreshTokenExpiration: new Date(res.refreshTokenExpiration).getTime(),
      });

      this.scheduleRotation(rotationPromise);
    } else {
      const rotationPromise = getTokenExpiry().then((expiry) => {
        if (expiry?.atExpires && expiry?.atExpires >= Date.now()) {
          this.logger.log('rtr', 'rotation scheduled with cached session data', expiry);
          return {
            accessTokenExpiration: new Date(expiry.atExpires).getTime(),
            refreshTokenExpiration: new Date(expiry.rtExpires).getTime(),
          };
        }

        // default: session data was corrupt but the resume-session request
        // succeeded so we know the cookies were valid at the time. short-term
        // expiry-values will kick off RTR in the very new future, allowing us
        // to grab values from the response.
        this.logger.log('rtr', 'rotation scheduled with default value');

        return {
          accessTokenExpiration: Date.now() + ms(RTR_AT_EXPIRY_IF_UNKNOWN),
          refreshTokenExpiration: Date.now() + ms(RTR_RT_EXPIRY_IF_UNKNOWN),
        };
      });

      this.scheduleRotation(rotationPromise);
    }
  }

  /**
   * ffetch
   * Inspect resource to determine whether it's a FOLIO API request.
   * * If it is an authentication-related request, complete the request
   *   and then execute the RTR callback to initiate that cycle.
   * * If it is a logout request, complete the request and swallow any
   *   errors because ... what would be the point of a failed logout
   *   request? It's telling you "you couldn't call /logout because
   *   you didn't have a cookie" i.e. you're already logged out".
   * * If it is a regular request, make sure RTR isn't in-flight (which
   *   would cause this request to fail if the RTR request finished
   *   processing first, because it would invalidate the old AT) and
   *   then proceed.
   *   If we catch an RTR error, emit a RTR_ERR_EVENT on the window and
   *   then swallow the error, allowing the application-level event handlers
   *   to handle that event.
   *   If we catch any other kind of error, re-throw it because it represents
   *   an application-specific problem that needs to be handled by an
   *   application-specific handler.
   *
   * @param {*} resource any resource acceptable to fetch()
   * @param {object} options
   * @returns Promise
   * @throws if any fetch fails
   */
  ffetch = async (resource, options = {}) => {
    // FOLIO API requests are subject to RTR
    if (isFolioApiRequest(resource, this.okapi.url)) {
      this.logger.log('rtrv', 'will fetch', resource);

      // on authentication, grab the response to kick of the rotation cycle,
      // then return the response
      if (isAuthenticationRequest(resource, this.okapi.url)) {
        this.logger.log('rtr', 'authn request', resource);
        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .then(res => {
            // a response can only be read once, so we clone it to grab the
            // tokenExpiration in order to kick of the rtr cycle, then return
            // the original
            const clone = res.clone();
            if (clone.ok) {
              this.logger.log('rtr', 'authn success!');
              clone.json().then(json => {
                // we want accessTokenExpiration. do we need to destructure?
                // in community-folio, a /login-with-expiry response is shaped like
                //   { ..., tokenExpiration: { accessTokenExpiration, refreshTokenExpiration } }
                // in eureka-folio, a /authn/token response is shaped like
                //   { accessTokenExpiration, refreshTokenExpiration }
                this.rotateCallback(json.tokenExpiration ?? json);
              });
            }

            return res;
          });
      }

      // on logout, never fail
      // if somebody does something silly like delete their cookies and then
      // tries to logout, the logout request will fail. And that's fine, just
      // fine. We will let them fail, capturing the response and swallowing it
      // to avoid getting stuck in an error loop.
      if (isLogoutRequest(resource, this.okapi.url)) {
        this.logger.log('rtr', 'logout request');

        return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }])
          .catch(err => {
            // kill me softly: return an empty response to allow graceful failure
            console.error('-- (rtr-sw) logout failure', err); // eslint-disable-line no-console
            return Promise.resolve(new Response(JSON.stringify({})));
          });
      }

      return getPromise(this.logger)
        .then(() => {
          this.logger.log('rtrv', 'post-rtr-fetch', resource);
          return this.nativeFetch.apply(global, [resource, options && { ...options, ...OKAPI_FETCH_OPTIONS }]);
        })
        .catch(err => {
          if (err instanceof RTRError) {
            console.error('RTR failure', err); // eslint-disable-line no-console
            window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
            return Promise.resolve(new Response(JSON.stringify({})));
          }

          throw err;
        });
    }

    // default: pass requests through to the network
    return Promise.resolve(this.nativeFetch.apply(global, [resource, options]));
  };
}
