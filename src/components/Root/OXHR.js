import { okapi } from 'stripes-config';
import { isOkapiRequest } from './FFetch';

// export default (NativeXHR) => {
//   return class OXHRClass {
//     constructor() {
//       this._nativeXHR = new NativeXHR();
//       /* eslint-disable */
//       for (let m in this._nativeXHR) {
//         this[m] = this._nativeXHR[m];
//         if (typeof this[m] === 'function') {
//           this[m] = this[m].bind(this._nativeXHR);
//         }
//       }
//       /* eslint-disable */

//       this.send = this.fakeSend;
//       this.open = this.fakeOpen;
//       // this.withCredentials = true;
//       this._nativeXHR.withCredentials = true;
//     }

//     fakeOpen = (method, url) => {
//       this.shouldEnsureToken = isOkapiRequest(url, okapi.url);
//       this._nativeXHR.open.apply(this._nativeXHR, [method, url]);
//     }

//     fakeSend = async (payload) => {
//       console.log('capture XHR');
//       if (shouldEnsureToken) {
//         await rtr()
//           .then(() => {
//             this._nativeXHR.send.apply(this._nativeXHR, payload);
//           })
//       }
//       this._nativeXHR.send.apply(this._nativeXHR, payload);
//     }
//   }
// };

export default class OXHR extends global.XMLHttpRequest {
  constructor() {
    super();
    this.shouldEnsureToken = false;
  }

  open = (method, url) => {
    console.log('capture XHR open');
    this.shouldEnsureToken = isOkapiRequest(url, okapi.url);
    super.open(method, url);
  }

  send = async (payload) => {
    console.log('capture XHR send');
    if (this.shouldEnsureToken) {
      super.send(payload);
    } else {
      super.send(payload);
    }
  }
}
