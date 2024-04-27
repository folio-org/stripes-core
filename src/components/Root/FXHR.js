import { okapi } from 'stripes-config';
import { getPromise, isFolioApiRequest, rtr, isValidAT, isValidRT } from './token-util';
import { getTokenExpiry } from '../../loginServices';
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
      this.shouldEnsureToken = isFolioApiRequest(url, okapi.url);
      super.open(method, url);
    }

    send = async (payload) => {
      const { logger } = this.FFetchContext;
      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      if (this.shouldEnsureToken) {
        try {
          await getPromise(logger);
          super.send(payload);
        } catch (err) {
          if (err instanceof RTRError) {
            console.error('RTR failure while attempting XHR', err); // eslint-disable-line no-console
            document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
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
