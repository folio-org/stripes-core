/* eslint-disable no-unused-vars */
import { FFetch } from './FFetch';
import { RTRError } from './Errors';

jest.mock('./rotateAndReplay', () => ({
  rotateAndReplay: jest.fn(),
  RTR_LOCK_KEY: 'test-lock',
}));

jest.mock('../../loginServices', () => ({
  getTokenExpiry: jest.fn(),
}));

describe('FFetch behavior and rotation helpers', () => {
  let originalFetch;
  let mockFetch;
  const okapiUrl = 'http://okapi';

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    mockFetch = jest.fn();
    globalThis.fetch = mockFetch;

    // polyfill navigator.locks for jsdom
    if (!globalThis.navigator) globalThis.navigator = {};
    if (!globalThis.navigator.locks) {
      globalThis.navigator.locks = {
        request: async (...av) => {
          if (av.length === 3) return av[2]();
          if (av.length === 2) return av[1]();
          throw new Error('Cannot call navigator.locks.request without a function to execute!');
        },
      };
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('passes through non-Okapi requests', async () => {
    mockFetch.mockResolvedValueOnce('non-okapi-success');
    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await globalThis.fetch('https://example.com/foo');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res).toBe('non-okapi-success');
  });

  it('uses native fetch for Okapi requests and returns when ok', async () => {
    const expected = { ok: true, data: 'ok' };
    mockFetch.mockResolvedValueOnce(expected);

    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await globalThis.fetch(`${okapiUrl}/resource`);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res).toBe(expected);
  });

  it('uses navigator.locks.request when available', async () => {
    // provide LockManager
    const lockCb = jest.fn((key, opts, cb) => cb());
    // @ts-ignore
    globalThis.navigator.locks = { request: lockCb };

    mockFetch.mockResolvedValueOnce({ ok: true });
    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await globalThis.fetch(`${okapiUrl}/locked`);

    expect(lockCb).toHaveBeenCalled();
    expect(res).toEqual({ ok: true });
  });

  describe('when invoking rotation', () => {
    it('returns error responses when rotation does not handle them', async () => {
      const { rotateAndReplay } = require('./rotateAndReplay');

      const failResp = { ok: false, status: 404, body: 'ruhroh, "the island of missing trees" was, um, missing' };

      // the fetch will fail, then rotation will reject with the same response
      mockFetch.mockResolvedValueOnce(failResp);
      rotateAndReplay.mockResolvedValueOnce(failResp);

      const ff = new FFetch({ logger: console, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceFetch();

      const res = await globalThis.fetch(`${okapiUrl}/explode`);
      expect(res).toBe(failResp);
    });

    it('seamlessly handles rotation when a fetch returns with { ok: false }', async () => {
      const { rotateAndReplay } = require('./rotateAndReplay');

      const authnFailResp = { ok: false, status: 401, body: 'ruhroh' };
      const successResp = { ok: true, status: 200, body: 'the island of missing trees' };

      // the fetch will fail, then rotation will resolve with the expected response
      mockFetch.mockResolvedValueOnce(authnFailResp);
      rotateAndReplay.mockResolvedValueOnce(successResp);

      const ff = new FFetch({ logger: console, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceFetch();

      const res = await globalThis.fetch(`${okapiUrl}/explode`);
      expect(res).toBe(successResp);
    });

    it('rejects with a rotation error when rotation itself fails, e.g. times out', async () => {
      const { rotateAndReplay } = require('./rotateAndReplay');

      const failResp = { ok: false, status: 404, body: 'ruhroh, "the island of missing trees" was, um, missing' };
      const rotationError = 'wherefore art thou, Lorax?';

      // the fetch fails, invoking rotation, which itself fails
      mockFetch.mockResolvedValueOnce(failResp);
      rotateAndReplay.mockRejectedValueOnce(new RTRError(rotationError));

      const ff = new FFetch({ logger: console, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceFetch();

      await expect(globalThis.fetch(`${okapiUrl}/explode`)).rejects.toThrow(rotationError);
    });
  });

  describe('rotationConfig helpers', () => {
    describe('shouldRotate', () => {
      describe('returns true', () => {
        it('given a 400 with okapi\'s special error text, returns true', async () => {
          const res = new Response('Token missing, access requires permission', { status: 400 })
          const ff = new FFetch({ logger: {}, okapi: { url: '/users-keycloak/_self', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(res);
          expect(shouldRotate).toBe(true);
        });

        it('given a 404 at /users-keycloak/_self', async () => {
          const res = new Response('whateva', { status: 404, url: '/users-keycloak/_self' });
          const ff = new FFetch({ logger: {}, okapi: { url: '/bl-users/_self', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(res);
          expect(shouldRotate).toBe(true);
        });

        it('given a 404 at /bl-users/_self', async () => {
          const res = new Response('whateva', { status: 404, url: '/bl-users/_self' });
          const ff = new FFetch({ logger: {}, okapi: { url: '/bl-users/_self', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(res);
          expect(shouldRotate).toBe(true);
        });

        it('given a 422 at /authn/logout', async () => {
          const res = new Response('whateva', { status: 422, url: '/authn/logout' });
          const ff = new FFetch({ logger: {}, okapi: { url: '/bl-users/_self', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(res);
          expect(shouldRotate).toBe(true);
        });
      });

      describe('returns false', () => {
        it('without a response to investigate', async () => {
          const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate();
          expect(shouldRotate).toBe(false);
        });

        it('given a 400 without okapi\'s specific text', async () => {
          const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(new Response('Nobody here but us chickens', { status: 400 }));
          expect(shouldRotate).toBe(false);
        });

        it('given a 404 somewhere other than /users-keycloak/_self or /bl-users/_self', async () => {
          const ff = new FFetch({ logger: {}, okapi: { url: '/somewhere/safe', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(new Response('Nobody here but us chickens', { status: 404 }));
          expect(shouldRotate).toBe(false);
        });

        it('given a 422 somewhere other than /authn/logout', async () => {
          const ff = new FFetch({ logger: {}, okapi: { url: '/somewhere/safe', tenant: 't' }, onRotate: jest.fn() });
          const shouldRotate = await ff.rotationConfig.shouldRotate(new Response('Nobody here but us chickens', { status: 404 }));
          expect(shouldRotate).toBe(false);
        });
      });
    });

    it('rotate() performs a refresh and returns parsed expirations on success', async () => {
      const accessISO = new Date(Date.now() + 10000).toISOString();
      const refreshISO = new Date(Date.now() + 20000).toISOString();

      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      // stub nativeFetch used by rotate()
      ff.nativeFetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ accessTokenExpiration: accessISO, refreshTokenExpiration: refreshISO }) });

      const res = await ff.rotationConfig.rotate();
      expect(res).toEqual({ accessTokenExpiration: accessISO, refreshTokenExpiration: refreshISO });
    });

    it('rotate() throws when refresh response is not ok', async () => {
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.nativeFetch = jest.fn().mockResolvedValueOnce({ ok: false });

      await expect(ff.rotationConfig.rotate()).rejects.toThrow('Rotation failure!');
    });

    it('rotate() throws when refresh response is missing fields', async () => {
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.nativeFetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ foo: 'bar' }) });

      await expect(ff.rotationConfig.rotate()).rejects.toThrow('Rotation failure!');
    });

    it('replaceXMLHttpRequest sets global.XMLHttpRequest and preserves the original', () => {
      const dummy = function OldXhr() { };
      globalThis.XMLHttpRequest = dummy;

      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceXMLHttpRequest();

      expect(ff.NativeXHR).toBe(dummy);
      expect(globalThis.XMLHttpRequest).not.toBe(dummy);

      // restore to avoid side effects
      globalThis.XMLHttpRequest = dummy;
    });

    it('rotationConfig.options merges OKAPI_FETCH_OPTIONS into options', () => {
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      const out = ff.rotationConfig.options({ headers: { 'x': '1' } });

      expect(out.credentials).toBe('include');
      expect(out.mode).toBe('cors');
      expect(out.headers).toEqual({ 'x': '1' });
    });

    it('rotationConfig.onSuccess calls the provided onRotate callback with new tokens', async () => {
      const onRotate = jest.fn();
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate });

      const tokens = { accessTokenExpiration: 'a', refreshTokenExpiration: 'b' };
      await ff.rotationConfig.onSuccess(tokens);

      expect(onRotate).toHaveBeenCalledWith(tokens);
    });

    it('rotationConfig.onFailure dispatches an RTR error event', async () => {
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      const spy = jest.spyOn(globalThis, 'dispatchEvent');

      await ff.rotationConfig.onFailure(new Error('boom'));

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
