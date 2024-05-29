// yeah, eslint, we're doing something kinda dicey here, using
// FFetch for the reassign globals side-effect in its constructor.
/* eslint-disable no-unused-vars */

import { getTokenExpiry } from '../../loginServices';
import { FFetch } from './FFetch';
import { RTRError, UnexpectedResourceError } from './Errors';

jest.mock('../../loginServices', () => ({
  ...(jest.requireActual('../../loginServices')),
  setTokenExpiry: jest.fn(() => Promise.resolve()),
  getTokenExpiry: jest.fn(() => Promise.resolve())
}));

jest.mock('stripes-config', () => ({
  url: 'okapiUrl',
  tenant: 'okapiTenant',
  okapi: {
    url: 'okapiUrl',
    tenant: 'okapiTenant'
  }
}),
{ virtual: true });

const log = jest.fn();

const mockFetch = jest.fn();

describe('FFetch class', () => {
  beforeEach(() => {
    global.fetch = mockFetch;
    getTokenExpiry.mockResolvedValue({
      atExpires: Date.now() + (10 * 60 * 1000),
      rtExpires: Date.now() + (10 * 60 * 1000),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Calling a non-FOLIO API', () => {
    it('calls native fetch once', async () => {
      mockFetch.mockResolvedValueOnce('non-okapi-success');
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('nonOkapiURL', { testOption: 'test' });
      await expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('non-okapi-success');
    });
  });

  describe('Calling a FOLIO API fetch', () => {
    it('calls native fetch once', async () => {
      mockFetch.mockResolvedValueOnce('okapi-success');
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();
      const response = await global.fetch('okapiUrl/whatever', { testOption: 'test' });
      await expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('okapi-success');
    });
  });

  describe('logging in', () => {
    it('calls native fetch once', async () => {
      const tokenExpiration = {
        accessTokenExpiration: new Date().toISOString()
      };
      const json = () => Promise.resolve({ tokenExpiration });
      // this mock is a mess because the login-handler clones the response
      // in order to (1) grab token expiration and kick off RTR and (2) pass
      // the un-read-response back to the login handler
      mockFetch.mockResolvedValueOnce({
        clone: () => ({
          json
        }),
        json,
      });
      const testFfetch = new FFetch({
        logger: { log },
        store: {
          dispatch: jest.fn(),
        }
      });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('okapiUrl/bl-users/login-with-expiry', { testOption: 'test' });

      // calls native fetch
      expect(mockFetch.mock.calls).toHaveLength(1);

      // login returns the original response
      const res = await response.json();
      expect(res).toMatchObject({ tokenExpiration });
    });
  });

  describe('logging out', () => {
    it('calls native fetch once to log out', async () => {
      mockFetch.mockResolvedValueOnce('logged out');
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('logged out');
    });
  });

  describe('logging out fails', () => {
    it('fetch failure is silently trapped', async () => {
      mockFetch.mockRejectedValueOnce('logged out FAIL');

      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      let ex = null;
      let response = null;
      try {
        response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      } catch (e) {
        ex = e;
      }
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual(new Response(JSON.stringify({})));
    });
  });

  describe('logging out', () => {
    it('Calling an okapi fetch with valid token...', async () => {
      mockFetch.mockResolvedValueOnce('okapi success');
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('okapiUrl/valid', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('okapi success');
    });
  });

  describe('Calling an okapi fetch with missing token...', () => {
    it('returns the error', async () => {
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce('failure');
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('failure');
    });
  });

  describe('Calling an okapi fetch with valid token, but failing request...', () => {
    it('returns response from failed fetch, only calls fetch once.', async () => {
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          'An error occurred',
          {
            status: 403,
            headers: {
              'content-type': 'text/plain',
            },
          }
        ));
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      const message = await response.text();
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(message).toEqual('An error occurred');
    });
  });

  describe('Calling an okapi fetch with missing token and failing rotation...', () => {
    it('triggers rtr...calls fetch 2 times, failed call, failed token call, throws error', async () => {
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          'Token missing',
          {
            status: 400,
            headers: {
              'content-type': 'text/plain',
            },
          }
        ))
        .mockRejectedValueOnce(new Error('token error message'));
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      try {
        await global.fetch('okapiUrl', { testOption: 'test' });
      } catch (e) {
        expect(e.toString()).toEqual('Error: token error message');
        expect(mockFetch.mock.calls).toHaveLength(2);
        expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      }
    });
  });

  describe('Calling an okapi fetch with missing token and reported error from auth service...', () => {
    it('throws an RTR error', async () => {
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          'Token missing',
          {
            status: 400,
            headers: {
              'content-type': 'text/plain',
            },
          }
        ))
        .mockResolvedValueOnce(new Response(
          JSON.stringify({ errors: ['missing token-getting ability'] }),
          {
            status: 303,
            headers: {
              'content-type': 'application/json',
            }
          }
        ));
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      try {
        await global.fetch('okapiUrl', { testOption: 'test' });
      } catch (e) {
        expect(e instanceof RTRError).toBeTrue;
        expect(mockFetch.mock.calls).toHaveLength(2);
        expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      }
    });
  });

  describe('Calling an okapi fetch when all tokens are expired', () => {
    it('triggers an RTR error', async () => {
      getTokenExpiry.mockResolvedValueOnce({
        atExpires: Date.now() - (10 * 60 * 1000),
        rtExpires: Date.now() - (10 * 60 * 1000),
      });
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          JSON.stringify({ errors: ['missing token-getting ability'] }),
          {
            status: 303,
            headers: {
              'content-type': 'application/json',
            }
          }
        ));
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      try {
        await global.fetch('okapiUrl', { testOption: 'test' });
      } catch (e) {
        expect(e instanceof RTRError).toBeTrue;
        expect(mockFetch.mock.calls).toHaveLength(2);
        expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      }
    });
  });

  describe('Calling an okapi fetch with a malformed resource', () => {
    it('triggers an Unexpected Resource Error', async () => {
      getTokenExpiry.mockResolvedValueOnce({
        atExpires: Date.now() - (10 * 60 * 1000),
        rtExpires: Date.now() - (10 * 60 * 1000),
      });
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          JSON.stringify({ errors: ['missing token-getting ability'] }),
          {
            status: 303,
            headers: {
              'content-type': 'application/json',
            }
          }
        ));
      const testFfetch = new FFetch({ logger: { log } });
      testFfetch.replaceFetch();
      testFfetch.replaceXMLHttpRequest();

      try {
        await global.fetch({ foo: 'okapiUrl' }, { testOption: 'test' });
      } catch (e) {
        expect(e instanceof UnexpectedResourceError).toBeTrue;
        expect(mockFetch.mock.calls).toHaveLength(0);
      }
    });
  });
});
