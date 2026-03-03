import { getTokenExpiry } from '../../loginServices';
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
      this.FFetchContext = deps;
    }

    open = (method, url) => {
      this.FFetchContext.logger?.log('rtr', 'capture XHR.open');
      this.shouldEnsureToken = isFolioApiRequest(url, this.FFetchContext.okapi.url);
      super.open(method, url);
    }

    send = async (payload) => {
      const { logger } = this.FFetchContext;
      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      if (this.shouldEnsureToken) {
        try {
          const expiry = await getTokenExpiry();
          if (expiry?.atExpires < Date.now()) {
            await rotateAndReplay(
              this.FFetchContext.nativeFetch,
              { ...this.FFetchContext.rotationConfig, logger: this.FFetchContext.logger, shouldRotate: async () => Promise.resolve(true) },
            );
          }
          super.send(payload);
        } catch (err) {
          if (err instanceof RTRError) {
            console.error('RTR failure while attempting XHR', err); // eslint-disable-line no-console
            window.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
          }
          throw err;
        }
      } else {
        logger.log('rtr', 'request passed through, sending XHR...');
        super.send(payload);
      }
    };
  };
};
