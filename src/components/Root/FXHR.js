import { okapi } from 'stripes-config';
import { isFolioApiRequest, rtr, isValidAT, isValidRT } from './token-util';
import { getTokenExpiry } from '../../loginServices';
import {
  RTR_ERROR_EVENT,
} from './Events';
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
        if (!isValidAT(this.FFetchContext.tokenExpiration, logger)) {
          logger.log('rtr', 'local tokens expired; fetching from storage for XHR..');
          this.FFetchContext.tokenExpiration = await getTokenExpiry();
        }

        if (isValidAT(this.FFetchContext.tokenExpiration, logger)) {
          logger.log('rtr', 'local AT valid, sending XHR...');
          super.send(payload);
        } else if (isValidRT(this.FFetchContext.tokenExpiration, logger)) {
          logger.log('rtr', 'local RT valid, sending XHR...');
          await rtr(this.FFetchContext)
            .then(() => {
              logger.log('rtr', 'local RTtoken refreshed, sending XHR...');
              super.send(payload);
            })
            .catch(err => {
              if (err instanceof RTRError) {
                // console.error('RTR failure while attempting XHR', err); // eslint-disable-line no-console
                document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: err }));
              }

              throw err;
            });
        } else {
          logger.log('rtr', 'All tokens expired when attempting to send XHR');
          document.dispatchEvent(new Event(RTR_ERROR_EVENT, { detail: 'All tokens expired when sending XHR' }));
        }
      } else {
        logger.log('rtr', 'request passed through, sending XHR...');
        super.send(payload);
      }
    };
  };
};
