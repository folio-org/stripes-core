import { beforeEach, it, afterEach, describe } from 'mocha';
import { expect } from 'chai';
import startMirage from '../network/start';
import loadRemoteComponent from '../../../src/loadRemoteComponent';

describe('loadRemoteComponent', () => {
  let server;
  const mockRemoteUrl = 'http://example.com/testRemote/remoteEntry.js';
  const mockErrorUrl = 'http://example.com/nonexistent/remoteEntry.js';

  const mockRemoteName = 'testComponent';

  beforeEach(async function () {
    server = startMirage();
    server.get(mockRemoteUrl, () => {
      const mockScriptContent = `window['${mockRemoteName}'] = {
        init: function() { console.log("Component initialized"); },
        get: function() { return function() { return { default: 'I am a module' }; }}
      };
      `;

      return mockScriptContent;
    });

    server.get(mockErrorUrl, () => (server.serialize({ ok: false })));
  });

  afterEach(function () {
    server?.shutdown();
    server = null;
    delete window[mockRemoteName];
  });

  it('should load and evaluate the remote script', async () => {
    await loadRemoteComponent(mockRemoteUrl, mockRemoteName);
    expect(window[mockRemoteName]).to.be.an('object');
  });

  it('should handle errors when loading the remote script', async () => {
    try {
      await loadRemoteComponent(mockErrorUrl, mockRemoteName);
    } catch (error) {
      expect(error.message).to.equal(`Failed to fetch remote module from ${mockErrorUrl}`);
    }
  });
});
