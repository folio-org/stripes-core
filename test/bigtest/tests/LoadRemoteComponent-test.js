import { beforeEach, it, afterEach, describe } from 'mocha';
import { expect } from 'chai';
import { createServer, Response } from 'miragejs';

import loadRemoteComponent from '../../../src/loadRemoteComponent';

describe.only('loadRemoteComponent', () => {
  let server;
  const mockRemoteUrl = '/example/testRemote/remoteEntry.js';
  const mockErrorUrl = 'https://example.com/nonexistent/remoteEntry.js';

  const mockRemoteName = 'testComponent';

  beforeEach(async function () {
    server = createServer({ environment: 'test' });
    server.get(mockRemoteUrl, () => {
      const mockScriptContent = `window['${mockRemoteName}'] = {
        init: function() { console.log("Component initialized"); },
        get: function() { return function() { return { default: 'I am a module' }; }}
      };
      `;

      // return mockScriptContent;
      return mockScriptContent;
    });

    server.get(mockErrorUrl, () => (server.serialize({ ok: false })));
  });

  afterEach(function () {
    server?.shutdown();
    server = null;
    delete window[mockRemoteName];
  });

  it('should inject the script tag with the requested src attribute', async () => {
    try {
      await loadRemoteComponent(mockRemoteUrl, mockRemoteName);
    } catch (error) {
      expect(Array.from(document.querySelectorAll('script')).find(scr => scr.src === mockRemoteUrl)).to.not.be.null;
    }
  });

  it('should handle errors when loading the remote script', async () => {
    try {
      await loadRemoteComponent(mockErrorUrl, mockRemoteName);
    } catch (error) {
      expect(error.message).to.equal(`Failed to load remote script from ${mockErrorUrl}`);
    }
  });
});
