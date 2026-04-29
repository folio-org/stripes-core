import { rotateAndReplay } from './rotateAndReplay';
import { isFolioApiRequest } from './token-util';

export default (deps) => {
  return class FXHRClass extends XMLHttpRequest {
    constructor() {
      super();
      this.shouldEnsureToken = false;
      this.FFetchContext = deps;
    }

    open = (method, url) => {
      this.FFetchContext.logger?.log('rtr', 'capture XHR.open');
      this.shouldEnsureToken = isFolioApiRequest(url, this.FFetchContext.okapi.url);
      super.open(method, url);
    }

    /**
     * Capture failure-to-launch errors that are the result of calling send()
     * with an expired AT and attempt to re-launch. Pass all other errors up
     * to the superclass.
     * @param {ProgressEvent} e https://developer.mozilla.org/en-US/docs/Web/API/ProgressEvent
     */
    onerror = (e) => {
      // if no data was loaded, this is a FOLIO API request, and we have not
      // already restarted, one possibility is that the AT was expired. Rotate
      // and try again.
      if (e.loaded === 0 && this.shouldEnsureToken && !this.didRestart) {
        this.FFetchContext.logger?.log('rtr', 'XHR rotateAndReplay');
        rotateAndReplay(
          this.FFetchContext.nativeFetch,
          { ...this.FFetchContext.rotationConfig, logger: this.FFetchContext.logger, shouldRotate: async () => true },
        )
          .then(() => {
            this.didRestart = true;
            this.send(this.payload);
          });
      } else {
        super.onerror(e);
      }
    }

    send = (payload) => {
      // cache in case we need to conduct RTR and restart
      this.payload = payload;

      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      super.send(payload);
    };
  };
};
