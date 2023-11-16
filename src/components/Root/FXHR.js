import { okapi } from 'stripes-config';
import { isFolioApiRequest, rtr } from './token-util';

export default (deps) => {
  return class FXHRClass extends global.XMLHttpRequest {
    constructor() {
      super();
      this.shouldEnsureToken = false;
      this.FFetchContext = deps;
    }

    open = (method, url) => {
      this.FFetchContext.logger.log('rtr', 'capture XHR.open');
      this.shouldEnsureToken = isFolioApiRequest(url, okapi.url);
      super.open(method, url);
    }

    send = async (payload) => {
      this.FFetchContext.logger.log('rtr', 'capture XHR send');
      if (this.shouldEnsureToken) {
        await rtr(this.FFetchContext)
          .then(() => {
            super.send(payload);
          });
      } else {
        super.send(payload);
      }
    }
  };
};
