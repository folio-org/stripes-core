import { rotateAndReplay } from './rotateAndReplay';
import { isFolioApiRequest } from './token-util';
import {
  RTR_ERROR_EVENT,
} from './constants';
import { RTRError } from './Errors';

export default (deps) => {
  /**
   * FXHRClass
   * XMLHttpRequest wrapper that mirrors FFetch's reactive RTR behavior.
   *
   * For Okapi requests, it captures the outgoing request shape, sends it,
   * inspects terminal responses for auth failure (401 and Okapi token-missing
   * 400), rotates tokens once, and then replays the original request. For
   * non-Okapi requests, it passes through untouched.
   *
   * Consumer callbacks remain compatible with native XHR semantics by routing
   * readystatechange through an internal interceptor and invoking the assigned
   * callback with XHR-style this binding.
   */
  return class FXHRClass extends XMLHttpRequest {
    constructor() {
      super();

      /**
       * Sentinels controlling whether auth-failure handling should run and
       * whether rotation has already been attempted for the current request.
       */
      this.shouldEnsureToken = false;
      this.hasRetriedAuth = false;

      /**
       * Captured request details used to replay the original XHR after
       * successful token rotation.
       */
      this.requestOpenArgs = null;
      this.requestPayload = null;
      this.requestHeaders = [];
      this.requestWithCredentials = false;

      /**
       * Application callback passthrough and shared RTR dependencies.
       */
      this.userOnReadyStateChange = null;
      this.FFetchContext = deps;

      /**
       * Always route readystatechange through the wrapper so auth failures can
       * be handled before consumer callbacks are invoked.
       */
      super.onreadystatechange = this.handleInternalReadyStateChange;
    }

    /**
     * Preserve user-provided callback while keeping internal interception in place.
     */
    set onreadystatechange(handler) {
      this.userOnReadyStateChange = handler;
    }

    /**
     * Expose assigned callback for compatibility with native XHR usage patterns.
     */
    get onreadystatechange() {
      return this.userOnReadyStateChange;
    }

    /**
     * Invoke the user callback with native XHR-style this binding.
     */
    invokeUserOnReadyStateChange = (event) => {
      this.userOnReadyStateChange?.call(this, event);
    }

    /**
     * Capture request metadata needed for potential replay.
     */
    open = (method, url, ...rest) => {
      this.FFetchContext.logger?.log('rtr', 'capture XHR.open');
      this.shouldEnsureToken = isFolioApiRequest(url, this.FFetchContext.okapi.url);
      this.requestOpenArgs = [method, url, ...rest];
      this.requestHeaders = [];
      this.requestWithCredentials = false;
      this.hasRetriedAuth = false;
      super.open(method, url, ...rest);
    }

    /**
     * Persist outgoing headers so replay can reproduce the original request.
     */
    setRequestHeader = (header, value) => {
      this.requestHeaders.push([header, value]);
      super.setRequestHeader(header, value);
    }

    /**
     * Match auth failures handled by fetch wrapper: 401 and Okapi token-missing 400.
     */
    isAuthFailureResponse = () => {
      if (this.status === 401) {
        return true;
      }

      if (this.status === 400 && typeof this.responseText === 'string') {
        return this.responseText.startsWith('Token missing, access requires permission');
      }

      return false;
    }

    /**
     * Reissue the original request one time after rotation succeeds.
     */
    replayRequest = () => {
      if (!this.requestOpenArgs) {
        return false;
      }

      super.open(...this.requestOpenArgs);
      this.withCredentials = this.requestWithCredentials;
      this.requestHeaders.forEach(([header, value]) => {
        super.setRequestHeader(header, value);
      });
      super.send(this.requestPayload);

      return true;
    }

    /**
     * Rotate tokens on auth failure, then replay or surface the original failure.
     */
    handleAuthFailure = async (event) => {
      this.hasRetriedAuth = true;

      try {
        /**  rotateAndReplay is implemented to work with fetch requests, including original requests and response in
        *   its parameters, but this is not applicable to XHR requests, so we do not send the third
        *   parameter so this function only performs rotation within the lock implementation.
        */
        await rotateAndReplay(
          this.FFetchContext.nativeFetch,
          { ...this.FFetchContext.rotationConfig, logger: this.FFetchContext.logger, shouldRotate: async () => true },
        );

        const replayed = this.replayRequest();
        if (!replayed) {
          this.invokeUserOnReadyStateChange(event);
        }
      } catch (err) {
        if (err instanceof RTRError) {
          console.error('RTR failure while attempting XHR', err); // eslint-disable-line no-console
          window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
        }

        /**
         * Surface the original failed response to the XHR consumer when
         * rotation cannot recover the request.
         */
        this.invokeUserOnReadyStateChange(event);
      }
    }

    /**
     * Intercept DONE responses, trigger RTR when needed, then forward callbacks.
     */
    handleInternalReadyStateChange = (event) => {
      if (this.readyState !== this.DONE) {
        this.invokeUserOnReadyStateChange(event);
        return;
      }

      const shouldRetry = this.shouldEnsureToken && !this.hasRetriedAuth && this.isAuthFailureResponse();
      if (shouldRetry) {
        this.handleAuthFailure(event);
        return;
      }

      this.invokeUserOnReadyStateChange(event);
    }

    /**
     * Capture replay inputs before first send, then pass through to native XHR.
     */
    send = (payload) => {
      const { logger } = this.FFetchContext;
      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      this.requestPayload = payload;
      this.requestWithCredentials = this.withCredentials;

      if (!this.shouldEnsureToken) {
        logger.log('rtr', 'request passed through, sending XHR...');
      }

      super.send(payload);
    };
  };
};
