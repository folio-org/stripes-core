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
    originalFetch = global.fetch;
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // ensure navigator exists but without locks by default
    // @ts-ignore
    if (!global.navigator) global.navigator = {};
    // @ts-ignore
    delete global.navigator.locks;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('passes through non-Okapi requests', async () => {
    mockFetch.mockResolvedValueOnce('non-okapi-success');
    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await global.fetch('https://example.com/foo');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res).toBe('non-okapi-success');
  });

  it('uses native fetch for Okapi requests and returns when ok', async () => {
    const expected = { ok: true, data: 'ok' };
    mockFetch.mockResolvedValueOnce(expected);

    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await global.fetch(`${okapiUrl}/resource`);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(res).toBe(expected);
  });

  it('uses navigator.locks.request when available', async () => {
    // provide LockManager
    const lockCb = jest.fn((key, opts, cb) => cb());
    // @ts-ignore
    global.navigator.locks = { request: lockCb };

    mockFetch.mockResolvedValueOnce({ ok: true });
    const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
    ff.replaceFetch();

    const res = await global.fetch(`${okapiUrl}/locked`);

    expect(lockCb).toHaveBeenCalled();
    expect(res).toEqual({ ok: true });
  });

  describe('when invoking rotation', () => {
    it('returns error responses when rotation does not handle them', async () => {
      const { rotateAndReplay } = require('./rotateAndReplay');

      const failResp = { ok: false, status: 404, body: 'ruhroh, "the island of missing trees" was, um, missing' };

      // the fetch will fail, then rotation will reject with the same response
      mockFetch.mockResolvedValueOnce(failResp);
      rotateAndReplay.mockRejectedValueOnce({ response: failResp });

      const ff = new FFetch({ logger: console, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceFetch();

      const res = await global.fetch(`${okapiUrl}/explode`);
      expect(res).toBe(failResp);
    });

    it('seamlessly handles rotation when a fetch fails with 401', async () => {
      const { rotateAndReplay } = require('./rotateAndReplay');

      const authnFailResp = { ok: false, status: 401, body: 'ruhroh' };
      const successResp = { ok: true, status: 200, body: 'the island of missing trees' };

      // the fetch will fail, then rotation will resolve with the expected response
      mockFetch.mockResolvedValueOnce(authnFailResp);
      rotateAndReplay.mockResolvedValueOnce(successResp);

      const ff = new FFetch({ logger: console, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceFetch();

      const res = await global.fetch(`${okapiUrl}/explode`);
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

      await expect(global.fetch(`${okapiUrl}/explode`)).rejects.toThrow(rotationError);
    });
  });

  describe('rotationConfig helpers', () => {
    it('rotate() performs a refresh and returns parsed expirations on success', async () => {
      const accessISO = new Date(Date.now() + 10000).toISOString();
      const refreshISO = new Date(Date.now() + 20000).toISOString();

      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      // stub nativeFetch used by rotate()
      ff.nativeFetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ accessTokenExpiration: accessISO, refreshTokenExpiration: refreshISO }) });

      const res = await ff.rotationConfig.rotate();
      expect(res).toEqual({ accessTokenExpiration: accessISO, refreshTokenExpiration: refreshISO });
    });

    it('rotate() throws when refresh response is not ok or missing fields', async () => {
      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.nativeFetch = jest.fn().mockResolvedValueOnce({ ok: false });

      await expect(ff.rotationConfig.rotate()).rejects.toThrow('Rotation failure!');
    });

    it('isValidToken returns true when token expiry is in future and false otherwise', async () => {
      const { getTokenExpiry } = require('../../loginServices');
      const ff = new FFetch({ logger: { log: jest.fn() }, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });

      getTokenExpiry.mockResolvedValueOnce({ atExpires: Date.now() + 10000 });
      await expect(ff.rotationConfig.isValidToken()).resolves.toBe(true);

      getTokenExpiry.mockResolvedValueOnce({ atExpires: Date.now() - 10000 });
      await expect(ff.rotationConfig.isValidToken()).resolves.toBe(false);

      getTokenExpiry.mockRejectedValueOnce(new Error('no storage'));
      await expect(ff.rotationConfig.isValidToken()).resolves.toBe(false);
    });

    it('replaceXMLHttpRequest sets global.XMLHttpRequest and preserves the original', () => {
      const dummy = function OldXhr() { };
      global.XMLHttpRequest = dummy;

      const ff = new FFetch({ logger: {}, okapi: { url: okapiUrl, tenant: 't' }, onRotate: jest.fn() });
      ff.replaceXMLHttpRequest();

      expect(ff.NativeXHR).toBe(dummy);
      expect(global.XMLHttpRequest).not.toBe(dummy);

      // restore to avoid side effects
      global.XMLHttpRequest = dummy;
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
      const spy = jest.spyOn(window, 'dispatchEvent');

      await ff.rotationConfig.onFailure(new Error('boom'));

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
