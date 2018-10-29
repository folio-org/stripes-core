/* eslint-disable-next-line import/no-extraneous-dependencies */
import FakeXMLHttpRequest from 'fake-xml-http-request';

/**
 * Stripes connect relies on the response.url property that is part of
 * the `fetch` API. The fetch polyfill we use to simulate network
 * requests keys off of the `responseURL` property of the underlying
 * XMLHttpRequest. However, there the XHR polyfill used by mirage
 * under the hood does not set this property, and so as a result the
 * response.url property is not set.
 *
 * This monkey-patches the polyfill until such time as this pull
 * request to accomplish the same is released and integrated.
 * https://github.com/pretenderjs/FakeXMLHttpRequest/pull/43
*/

const original = FakeXMLHttpRequest.prototype.open;

function open(method, url, async, username, password) {
  const result = original.call(this, method, url, async, username, password);
  this.responseURL = url;
  return result;
}

FakeXMLHttpRequest.prototype.open = open;
