/* eslint-disable */
import FakeXMLHttpRequest from 'fake-xml-http-request';

/**
 * Monkey patch FakeXMLHttpRequest and remove `response` based on the work in:
 * https://github.com/pretenderjs/FakeXMLHttpRequest/pull/53/files
 *
 * which caused the issue described under:
 *
 * https://github.com/pretenderjs/FakeXMLHttpRequest/issues/54
 *
 */

var _Event = function Event(type, bubbles, cancelable, target) {
  this.type = type;
  this.bubbles = bubbles;
  this.cancelable = cancelable;
  this.target = target;
};

_Event.prototype = {
  stopPropagation: function () {},
  preventDefault: function () {
    this.defaultPrevented = true;
  }
};

FakeXMLHttpRequest.prototype.open = function(method, url, async, username, password) {
  this.method = method;
  this.url = url;
  this.async = typeof async == "boolean" ? async : true;
  this.username = username;
  this.password = password;
  this.responseText = null;
  this.responseXML = null;
  this.responseURL = url;
  this.requestHeaders = {};
  this.sendFlag = false;
  delete this.response;
  this._readyStateChange(FakeXMLHttpRequest.OPENED);
}

FakeXMLHttpRequest.prototype.abort = function() {
  this.aborted = true;
  this.responseText = null;
  delete this.response;
  this.errorFlag = true;
  this.requestHeaders = {};

  this.dispatchEvent(new _Event("abort", false, false, this));

  if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
    this._readyStateChange(FakeXMLHttpRequest.UNSENT);
    this.sendFlag = false;
  }

  if (typeof this.onerror === "function") {
    this.onerror();
  }
}

FakeXMLHttpRequest.prototype._setResponseBody = function (body) {
  verifyRequestSent(this);
  verifyHeadersReceived(this);
  verifyResponseBodyType(body);

  var chunkSize = this.chunkSize || 10;
  var index = 0;
  this.responseText = "";
  delete this.response;

  do {
    if (this.async) {
      this._readyStateChange(FakeXMLHttpRequest.LOADING);
    }

    this.responseText += body.substring(index, index + chunkSize);
    index += chunkSize;
  } while (index < body.length);

  var type = this.getResponseHeader("Content-Type");

  if (this.responseText && (!type || /(text\/xml)|(application\/xml)|(\+xml)/.test(type))) {
    try {
      this.responseXML = parseXML(this.responseText);
    } catch (e) {
      // Unable to parse XML - no biggie
    }
  }

  if (this.async) {
    this._readyStateChange(FakeXMLHttpRequest.DONE);
  } else {
    this.readyState = FakeXMLHttpRequest.DONE;
  }
};

function verifyRequestSent(xhr) {
  if (xhr.readyState == FakeXMLHttpRequest.DONE) {
      throw new Error("Request done");
  }
}

function verifyHeadersReceived(xhr) {
  if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {
      throw new Error("No headers received");
  }
}

function verifyResponseBodyType(body) {
  if (typeof body != "string") {
      var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                           body + ", which is not a string.");
      error.name = "InvalidBodyException";
      throw error;
  }
}

/*
  Cross-browser XML parsing. Used to turn
  XML responses into Document objects
  Borrowed from JSpec
*/
function parseXML(text) {
  var xmlDoc;

  if (typeof DOMParser != "undefined") {
    var parser = new DOMParser();
    xmlDoc = parser.parseFromString(text, "text/xml");
  } else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(text);
  }

  return xmlDoc;
}
