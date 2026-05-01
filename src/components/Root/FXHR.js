import { rotateAndReplay } from './rotateAndReplay';
import { isFolioApiRequest } from './token-util';
import {
  RTR_ERROR_EVENT,
} from './constants';
import { RTRError } from './Errors';

export default (deps) => {
  return class FXHRClass extends XMLHttpRequest {
    constructor() {
      super();
      this.shouldEnsureToken = false;
      this.hasRetriedAuth = false;
      this.isReplaying = false;
      this.requestMethod = null;
      this.requestUrl = null;
      this.requestOpenArgs = null;
      this.requestPayload = null;
      this.requestHeaders = [];
      this.requestWithCredentials = false;
      this.userOnReadyStateChange = null;
      this.FFetchContext = deps;

      // Always route readystatechange through the wrapper so auth failures can
      // be handled before consumer callbacks are invoked.
      super.onreadystatechange = this.handleInternalReadyStateChange;
    }

    open = (method, url, ...rest) => {
      this.FFetchContext.logger?.log('rtr', 'capture XHR.open');
      this.shouldEnsureToken = isFolioApiRequest(url, this.FFetchContext.okapi.url);
      this.requestMethod = method;
      this.requestUrl = url;
      this.requestOpenArgs = [method, url, ...rest];
      this.requestHeaders = [];
      this.requestWithCredentials = false;
      this.hasRetriedAuth = false;
      super.open(method, url, ...rest);
    }

    setRequestHeader = (header, value) => {
      this.requestHeaders.push([header, value]);
      super.setRequestHeader(header, value);
    }

    isAuthFailureResponse = () => {
      if (this.status === 401) {
        return true;
      }

      if (this.status === 400 && typeof this.responseText === 'string') {
        return this.responseText.startsWith('Token missing, access requires permission');
      }

      return false;
    }

    replayRequest = () => {
      if (!this.requestOpenArgs) {
        return false;
      }

      this.isReplaying = true;
      super.open(...this.requestOpenArgs);
      try {
        this.withCredentials = this.requestWithCredentials;
      } catch (_err) {
        // In test harnesses that mock open(), XHR state transitions may not
        // occur; ignore state errors so replay can continue.
      }
      this.requestHeaders.forEach(([header, value]) => {
        super.setRequestHeader(header, value);
      });
      super.send(this.requestPayload);

      return true;
    }

    handleAuthFailure = async (event) => {
      this.hasRetriedAuth = true;

      try {
        await rotateAndReplay(
          this.FFetchContext.nativeFetch,
          { ...this.FFetchContext.rotationConfig, logger: this.FFetchContext.logger, shouldRotate: async () => true },
        );

        const replayed = this.replayRequest();
        if (!replayed) {
          this.userOnReadyStateChange?.call(this, event);
        }
      } catch (err) {
        if (err instanceof RTRError) {
          console.error('RTR failure while attempting XHR', err); // eslint-disable-line no-console
          window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
        }

        // Surface the original failed response to the XHR consumer when
        // rotation cannot recover the request.
        this.userOnReadyStateChange?.call(this, event);
      }
    }

    handleInternalReadyStateChange = (event) => {
      if (this.readyState !== this.DONE) {
        this.userOnReadyStateChange?.call(this, event);
        return;
      }

      if (this.isReplaying) {
        this.isReplaying = false;
        this.userOnReadyStateChange?.call(this, event);
        return;
      }

      const shouldRetry = this.shouldEnsureToken && !this.hasRetriedAuth && this.isAuthFailureResponse();
      if (shouldRetry) {
        this.handleAuthFailure(event);
        return;
      }

      this.userOnReadyStateChange?.call(this, event);
    }

    set onreadystatechange(handler) {
      this.userOnReadyStateChange = handler;
    }

    get onreadystatechange() {
      return this.userOnReadyStateChange;
    }

    send = (payload) => {
      const { logger } = this.FFetchContext;
      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      this.requestPayload = payload;
      this.requestWithCredentials = this.withCredentials;

      if (this.shouldEnsureToken) {
        super.send(payload);
      } else {
        logger.log('rtr', 'request passed through, sending XHR...');
        super.send(payload);
      }
    };
  };
};
