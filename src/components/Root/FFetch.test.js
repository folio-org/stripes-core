import React from 'react';
import { render, screen, act, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import { log, error } from 'console';
import { FFetch } from './FFetch';

var mockGetItem = jest.fn(() => new Promise((resolve) => resolve(item)));

jest.mock('localForage', () => ({
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

var mockFetch = jest.fn();

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
      const testFfetch = new FFetch({logger: { log }})
      const response = await global.fetch('nonOkapiURL', { testOption: 'test' });
      await expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('non-okapi-success');
    });
  });

  describe('logging out', () => {
    it('calls native fetch once to log out', async () => {
      mockFetch.mockResolvedValueOnce('logged out');
      const testFfetch = new FFetch({logger: { log }})
      const response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual('logged out');
    });
  });

  describe('logging out fails', () => {
    it('calls native fetch once to log out', async () => {
      mockFetch.mockImplementationOnce(() => new Promise( (res, rej) => rej()));
      const testFfetch = new FFetch({logger: { log }})
      const response = await global.fetch('okapiUrl/authn/logout', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(1);
      expect(response).toEqual(new Response(JSON.stringify({})));
    });
  });

  describe('logging out', () => {
    it('Calling an okapi fetch with valid token...', async () => {
      mockFetch.mockResolvedValueOnce('okapi success');
      const testFfetch = new FFetch({logger: { log }})
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
          status: 403,
          headers: {
            'content-type': 'text/plain',
          },
        }))
        .mockResolvedValueOnce(new Response(JSON.stringify({
          accessTokenExpiration: new Date().getTime()+1000,
          refreshTokenExpiration: new Date().getTime()+ 2000,
        }), { ok: true }));
      const testFfetch = new FFetch({logger: { log }})
      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(3);
      expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
      expect(response).toEqual('success');
    });
  });

  describe('Calling an okapi fetch with missing token and failing rotation...', () => {
    it('triggers rtr...calls fetch 2 times, failed call, failed token call', async () => {
      mockFetch.mockResolvedValue('success')
      .mockResolvedValueOnce(new Response(
        'Token missing',
        {
          status: 403,
          headers: {
            'content-type': 'text/plain',
          },
        }))
        .mockRejectedValueOnce(new Error('token error message'));
      const testFfetch = new FFetch({logger: { log }})
      const response = await global.fetch('okapiUrl', { testOption: 'test' });
      expect(mockFetch.mock.calls).toHaveLength(2);
      expect(mockFetch.mock.calls[1][0]).toEqual('okapiUrl/authn/refresh');
    });
  });
});
