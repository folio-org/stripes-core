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

  describe('Handles 4xx responses', () => {
    it('400 token missing: triggers rtr...calls fetch 3 times, failed call, token call, successful call', async () => {
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

    it('400 NOT token missing: bubbles failure up to the application', async () => {
      mockFetch.mockResolvedValue(
        new Response(
          'Tolkien missing, send Frodo?',
          {
            status: 400,
            headers: {
              'content-type': 'text/plain',
            },
          }
        )
      );
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response.status).toEqual(400);
    });

    it('401 UnauthorizedException: triggers rtr...calls fetch 3 times, failed call, token call, successful call', async () => {
      mockFetch.mockResolvedValue('success')
        .mockResolvedValueOnce(new Response(
          JSON.stringify({
            'errors': [
              {
                'type': 'UnauthorizedException',
                'code': 'authorization_error',
                'message': 'Unauthorized'
              }
            ],
            'total_records': 1
          }),
          {
            status: 401,
            headers: {
              'content-type': 'application/json',
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

    it('401 NOT UnauthorizedException: bubbles failure up to the application', async () => {
      mockFetch.mockResolvedValue(
        new Response(
          JSON.stringify({
            'errors': [
              {
                'type': 'AuthorizedException',
                'code': 'chuck_brown',
                'message': 'Gong!'
              }
            ],
            'total_records': 1
          }),
          {
            status: 401,
            headers: {
              'content-type': 'application/json',
            },
          }
        )
      );
      const testFfetch = new FFetch({ logger: { log } });
      const response = (await global.fetch('okapiUrl', { testOption: 'test' }));
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response.status).toEqual(401);
    });
  });

  describe('Calling an okapi fetch with expired AT...', () => {
    it('triggers rtr...calls fetch 2 times - token call, successful call', async () => {
      getTokenExpiry.mockResolvedValueOnce({
        atExpires: Date.now() - (10 * 60 * 1000),
        rtExpires: Date.now() + (10 * 60 * 1000),
      });
      mockFetch.mockResolvedValue('token rotation success')
        .mockResolvedValueOnce(new Response(JSON.stringify({
          accessTokenExpiration: new Date().getTime() + 1000,
          refreshTokenExpiration: new Date().getTime() + 2000,
        }), { ok: true }));
      const testFfetch = new FFetch({ logger: { log } });
      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(2);
      expect(mockFetch.mock.calls[0][0]).toEqual('okapiUrl/authn/refresh');
      expect(response).toEqual('token rotation success');
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
            status: 400,
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
      try {
        await global.fetch({ foo: 'okapiUrl' }, { testOption: 'test' });
      } catch (e) {
        expect(e instanceof UnexpectedResourceError).toBeTrue;
        expect(mockFetch.mock.calls).toHaveLength(0);
      }
    });
  });
});
