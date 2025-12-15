import { beforeEach, it, describe } from 'mocha';
import { expect } from 'chai';
import setupApplication from '../helpers/setup-application-components';
import loadRemoteComponent from '../../../src/loadRemoteComponent';

describe('loadRemoteComponent', () => {
  setupApplication();
  const mockRemoteUrl = 'http://example.com/testRemote/remoteEntry.js';
  const mockErrorUrl = 'http://example.com/nonexistent/remoteEntry.js';

  const mockRemoteName = 'testComponent';

  beforeEach(async function () {
    this.server.get(mockRemoteUrl, () => {
      const mockScriptContent = `window['${mockRemoteName}'] = {
        init: function() { console.log("Component initialized"); },
        get: function() { return function() { return { default: 'I am a module' }; }}
      };
      `;

      return mockScriptContent;
    });

    this.server.get(mockErrorUrl, () => new Response(404));
  });

  it('should load and evaluate the remote script', async () => {
    await loadRemoteComponent(mockRemoteUrl, mockRemoteName);
    expect(window[mockRemoteName]).to.be.an('object');
  });

  it('should return the component from the remote script', async () => {
    try {
      await loadRemoteComponent(mockErrorUrl, mockRemoteName);
    } catch (error) {
      expect(error.message).to.equal('Failed to load remote component');
    }
  });
});
