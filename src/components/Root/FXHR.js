import { okapi } from 'stripes-config';
import { isFolioApiRequest, rtr, isValidAT, isValidRT } from './token-util';
import { getTokenExpiry } from '../../loginServices';

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
      const { tokenExpiration, logger } = this.FFetchContext;
      this.FFetchContext.logger?.log('rtr', 'capture XHR send');
      if (this.shouldEnsureToken) {
        if (!isValidAT(tokenExpiration, logger)) {
          logger.log('rtr', 'local tokens expired; fetching from storage for XHR..');
          this.FFetchContext.tokenExpiration = await getTokenExpiry();
        }

        if (isValidRT(this.FFetchContext.tokenExpiration, logger)) {
          logger.log('rtr', 'local refresh token valid, sending XHR...');
          super.send(payload);
        } else {
          await rtr(this.FFetchContext)
            .then(() => {
              logger.log('rtr', 'local token refreshed, sending XHR...');
              super.send(payload);
            });
        }
      } else {
        super.send(payload);
      }
    }
  };
};
