import { rotateAndReplay, RTR_LOCK_KEY } from './rotateAndReplay';

describe('rotateAndReplay', () => {
  const makeLogger = () => ({ log: jest.fn() });

  afterEach(() => {
    // clean up navigator if tests set it
    try {
      // eslint-disable-next-line no-undef
      if (typeof navigator !== 'undefined') {
        // @ts-ignore
        delete global.navigator;
      }
    } catch (e) { /* ignore */ }
    jest.clearAllMocks();
  });

  test('replays request when token is already valid (no rotation)', async () => {
    const fetchfx = jest.fn().mockResolvedValue('replayed-response');
    const config = {
      logger: makeLogger(),
      isValidToken: jest.fn().mockResolvedValue(true),
      options: jest.fn((opts) => opts),
      // shouldRotate intentionally provided as a function (see implementation)
      shouldRotate: async () => true,
    };

    const error = { resource: '/foo', options: { some: 'opt' } };

    const res = await rotateAndReplay(fetchfx, config, error);
    expect(res).toBe('replayed-response');
    expect(fetchfx).toHaveBeenCalledWith('/foo', { some: 'opt' });
    expect(config.isValidToken).toHaveBeenCalled();
  });

  test('performs rotation then replays when rotate resolves', async () => {
    const fetchfx = jest.fn().mockResolvedValue('after-rotate-response');
    const rotateResult = { token: 'abc' };
    const config = {
      logger: makeLogger(),
      isValidToken: jest.fn().mockResolvedValue(false),
      rotate: jest.fn().mockResolvedValue(rotateResult),
      onSuccess: jest.fn().mockResolvedValue(undefined),
      onFailure: jest.fn().mockResolvedValue(undefined),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => true,
    };

    const error = { resource: '/bar', options: { foo: 'bar' } };

    const res = await rotateAndReplay(fetchfx, config, error);
    expect(res).toBe('after-rotate-response');
    expect(config.rotate).toHaveBeenCalled();
    expect(config.onSuccess).toHaveBeenCalledWith(rotateResult);
    expect(fetchfx).toHaveBeenCalledWith('/bar', { foo: 'bar' });
  });

  test('calls onFailure and rejects original error when rotation fails', async () => {
    const fetchfx = jest.fn();
    const rotateErr = new Error('rotate failed');
    const config = {
      logger: makeLogger(),
      isValidToken: jest.fn().mockResolvedValue(false),
      rotate: jest.fn().mockRejectedValue(rotateErr),
      onSuccess: jest.fn().mockResolvedValue(undefined),
      onFailure: jest.fn().mockResolvedValue(undefined),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => true,
    };

    const originalError = { resource: '/baz', options: {}, response: { status: 401 } };

    await expect(rotateAndReplay(fetchfx, config, originalError)).rejects.toBe(originalError);
    expect(config.onFailure).toHaveBeenCalled();
    expect(fetchfx).not.toHaveBeenCalled();
  });

  test('rejects when response status not in configured statusCodes', async () => {
    const fetchfx = jest.fn();
    const config = {
      logger: makeLogger(),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => true,
    };

    const err = { response: { status: 403 }, options: {} };
    await expect(rotateAndReplay(fetchfx, config, err)).rejects.toBe(err);
  });

  test('rejects when rtrIgnore option is true', async () => {
    const fetchfx = jest.fn();
    const config = {
      logger: makeLogger(),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => true,
    };

    const err = { response: { status: 401 }, options: { rtrIgnore: true } };
    await expect(rotateAndReplay(fetchfx, config, err)).rejects.toBe(err);
  });

  test('rejects when shouldRotate returns false', async () => {
    const fetchfx = jest.fn();
    const config = {
      logger: makeLogger(),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => false,
    };

    const err = { response: { status: 401 }, options: {} };
    await expect(rotateAndReplay(fetchfx, config, err)).rejects.toBe(err);
  });

  test('uses navigator.locks.request when available', async () => {
    const fetchfx = jest.fn().mockResolvedValue('nav-lock-response');
    const rotateResult = { token: 'nav' };
    const config = {
      logger: makeLogger(),
      isValidToken: jest.fn().mockResolvedValue(false),
      rotate: jest.fn().mockResolvedValue(rotateResult),
      onSuccess: jest.fn().mockResolvedValue(undefined),
      onFailure: jest.fn().mockResolvedValue(undefined),
      options: jest.fn((opts) => opts),
      shouldRotate: async () => true,
    };

    // provide a navigator.locks.request mock that calls the provided callback
    // and captures key argument
    // @ts-ignore
    global.navigator = { locks: { request: jest.fn((key, cb) => cb()) } };

    const err = { resource: '/nav', options: {} };
    const res = await rotateAndReplay(fetchfx, config, err);
    expect(res).toBe('nav-lock-response');
    // ensure lock was requested with the exported key
    // @ts-ignore
    expect(global.navigator.locks.request).toHaveBeenCalledWith(RTR_LOCK_KEY, expect.any(Function));
  });
});
