// yeah, eslint, we're doing something kinda dicey here, using
// FFetch for the reassign globals side-effect in its constructor.
/* eslint-disable no-unused-vars */

import localforage from 'localforage';
import { log } from 'console';
import { FFetch } from './FFetch';
import { RTRError } from './Errors';

// defining mockGetItem with const or let causes it to fail with
// ReferenceError: Cannot access 'mockGetItem' before initialization
// but var works fine
//
// eslint-disable-next-line no-var
var mockGetItem = jest.fn((item) => new Promise((resolve) => resolve(item)));

jest.mock('localforage', () => ({
  setItem: () => new Promise((resolve) => resolve()),
  getItem: jest.fn(mockGetItem)
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

const mockFetch = jest.fn();

describe('FFetch class', () => {
  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Calling a non-okapi fetch', () => {
    it('calls native fetch once', async () => {
      mockFetch.mockResolvedValueOnce('non-okapi-success');
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('nonOkapiURL', { testOption: 'test' });
      await expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('non-okapi-success');
    });
  });

  describe('logging out', () => {
    it('calls native fetch once to log out', async () => {
      mockFetch.mockResolvedValueOnce('logged out');
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('logged out');
    });
  });

  describe('logging out fails', () => {
    it('calls native fetch once to log out', async () => {
      mockFetch.mockImplementationOnce(() => new Promise((res, rej) => rej()));
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual(new Response(JSON.stringify({})));
    });
  });

  describe('logging out', () => {
    it('Calling an okapi fetch with valid token...', async () => {
      mockFetch.mockResolvedValueOnce('okapi success');
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl/valid', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('okapi success');
    });
  });

  describe('Calling an okapi fetch with missing token...', () => {
    it('triggers rtr...calls fetch 3 times, failed call, token call, successful call', async () => {
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
        .mockResolvedValueOnce(new Response(JSON.stringify({
          accessTokenExpiration: new Date().getTime() + 1000,
          refreshTokenExpiration: new Date().getTime() + 2000,
        }), { ok: true }));
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(3);
      expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      expect(response).toEqual('success');
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
            status: 403,
            headers: {
              'content-type': 'text/plain',
            },
          }
        ))
        .mockRejectedValueOnce(new Error('token error message'));
      const testFfetch = new FFetch({ logger: { log } });
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
            status: 403,
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
      try {
        await global.fetch('okapiUrl', { testOption: 'test' });
      } catch (e) {
        expect(e instanceof RTRError).toBeTrue;
        expect(mockFetch.mock.calls).toHaveLength(2);
        expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      }
    });
  });
});
