import { okapi } from 'stripes-config';
import createInactivityTimer from 'inactivity-timer';

import {
  setAuthError,
} from './okapiActions';
import { defaultErrors } from './constants';

/**
 * StripesSession
 * Given access- and refresh-token expiration timestamps, start a timer
 * to generate an API request to keep the cookie fresh as long as there
 * has been some keyboard/mouse activity in the meantime.
 *
 * If the cookie cannot be renewed, dispatch clearCurrentUser and
 * clearOkapiToken.
 *
 * For any error condition, dispatch setAuthError as well as clearCurrentUser
 * and clearOkapiToken.
 *
 * @param {redux store} store
 * @param {object} tokenExpiration shaped like:
 * {
 *   'accessTokenExpiration': 'yyyy-mm-ddThh:ii:ssZ',
 *   'refreshTokenExpiration': 'yyyy-mm-ddThh:ii:ssZ',
 * }
 * @param {function} function to call on session expiration
 * @param {number} ttlFraction how much of the access-token's TTL should expire before refreshing
 */
export default class StripesSession {
  constructor(store, tokenExpiration, onLogout, ttlFraction = 0.9) {
    console.log('StripesSession init');
    this.store = store;
    this.onLogout = onLogout;
    this.ttlFraction = ttlFraction;

    this.processAuthnResponse(tokenExpiration);

    // logout via clearSession() when the access token expires
    //
    // configure an inactivity timer that fires when the access-token expires
    // if there hasn't been any keyboard or mouse activity. when activity
    // is detected, update the last-access timestamp and signal the timer
    // to keep the session active.
    //
    const ttl = Math.floor(new Date(tokenExpiration.accessTokenExpiration).getTime() / 1000) - this.now();
    console.log('clearing session in seconds: ', ttl);
    this.inactivityTimer = createInactivityTimer(`${ttl}s`, () => {
      this.clearSession();
    });

    // on any event, set the last-access timestamp and restart the inactivity timer.
    // if the access token has expired, renew it.
    ['keydown', 'mousedown'].forEach((event) => {
      document.addEventListener(event, () => {
        this.setLastAccess();
        if (this.inactivityTimer) {
          this.inactivityTimer.signal();
        }

        if (!this.accessTokenIsValid()) {
          this.exchangeRefresh();
        }
      });
    });
  }

  /**
   * clearSession
   * End the session, logging the user out. Stop listening for activity,
   * dispatch clear-user, dispatch clear-token.
   */
  clearSession = () => {
    console.trace('StripesSession::clearSession');
    if (this.inactivityTimer) {
      this.inactivityTimer.clear();
    }
    return this.onLogout(this.store);
  }

  /**
   * processAuthnResponse
   * Store an authentication response and set a timer to exchange the refresh-
   * token when the refresh-token is most of through its TTL. Wait, wait, wait, the
   * ACCESS-token? Yeah. Token-exchange is an async process, but all the legacy
   * code here just retrieves the token from the store in a sync process, meaning
   * there is no easy way to force it to await the resolution of that promise.
   * In other words, we just have to keep the access-token fresh because if it
   * goes stale, we don't have any mechanism to cause legacy code to wait while
   * we conduct the exchange.
   *
   * Kinda sucks, but what can you do?
   *
   * @param {object} { accessTokenExpiration, refreshTokenExpiration }
   */
  processAuthnResponse = (tokenExpiration) => {
    console.log('StripesSession::processAuthnResponse', tokenExpiration);
    Object.assign(this, tokenExpiration);

    // save token expiration times
    this.expiresAt = Math.floor(new Date(tokenExpiration.accessTokenExpiration).getTime() / 1000);
    this.refreshExpiresAt = Math.floor(new Date(tokenExpiration.refreshTokenExpiration).getTime() / 1000);

    this.setLastAccess();
    this.setLastRefresh();

    // configure next token-exchange
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    const ttl = this.expiresAt - this.now();
    console.log(`StripesSession::processAuthnResponse::setTimeout(${ttl * this.ttlFraction * 1000})`);
    this.timeoutId = setTimeout(() => this.exchangeRefresh(), ttl * this.ttlFraction * 1000);
  }

  /**
   * now
   * Return epoch time in seconds
   * @returns {number}
   */
  now = () => {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * setLastAccess
   * Log activity, i.e. keep the session alive.
   */
  setLastAccess = () => {
    this.lastAccess = this.now();
  }

  /**
   * setLastRefresh
   * Log the refresh-token's creation date so we can calculate when it expires.
   */
  setLastRefresh = () => {
    this.lastRefresh = this.now();
  }

  /**
   * accessTokenIsValid
   * return true if the access token is still valid.
   * @returns {boolean}
   */
  accessTokenIsValid = () => {
    return this.now() < this.expiresAt;
  };

  /**
   * refreshTokenIsValid
   * return true if the refresh token is still valid.
   * @returns {boolean}
   */
  refreshTokenIsValid = () => {
    console.log(`StripesSession::refreshTokenIsValid:: ${this.now()} < ${this.refreshExpiresAt}`);
    return this.now() < this.refreshExpiresAt;
  };

  /**
   * sessionIsActive
   * Return true if there has been activity since the refresh-token
   * was received.
   *
   * @returns {boolean}
   */
  sessionIsActive = () => {
    return this.lastAccess > this.lastRefresh;
  }

  /**
   * exchangeRefresh
   * Exchange the refresh token if the following are true:
   * 1. session is not idle
   * 2. refresh token is still valid
   *
   * for a new access token if the refresh token
   * is still valid and there has been session access since the refresh token
   * was instantiated.
   */
  exchangeRefresh = () => {
    console.trace('StripesSession::exchangeRefresh');

    if (this.sessionIsActive() && this.refreshTokenIsValid()) {
      // flag that a refresh request is currently in process
      fetch(`${okapi.url}/authn/refresh`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
      })
        .then(response => {
          if (response.ok) {
            response.json()
              .then(json => {
                this.processAuthnResponse(json);
              });
          } else {
            // if there are authn errors, warn about them. sorry, eslint.
            // eslint-disable-next-line no-console
            console.error('>>> ERROR IN REFRESH RESPONSE', response);
            throw Error(response.statusText);
          }
        })
        .catch(error => {
          // if there are authn errors, warn about them. sorry, eslint.
          // eslint-disable-next-line no-console
          console.error('>>> ERROR IN REFRESH', error);
          // @@ this.store.dispatch(setAuthError(error));
          this.store.dispatch(setAuthError([defaultErrors.DEFAULT_LOGIN_CLIENT_ERROR]));
          this.clearSession();
        });
    } else {
      console.log(`>>> SESSION LOGOUT: exchangeRefresh: not active/not valid ${this.sessionIsActive()} && ${this.refreshTokenIsValid()}`);
      this.clearSession();
    }
  }
}
