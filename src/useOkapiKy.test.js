import ky from 'ky';

import useOkapiKy, { usePublicGatewayKy } from './useOkapiKy';
import { useStripes } from './StripesContext';

jest.mock('ky', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

jest.mock('./StripesContext', () => ({
  useStripes: jest.fn(),
}));

const mockKyCreate = ky.create;
const mockUseStripes = useStripes;

const req = {
  headers: {
    set: jest.fn(),
  },
};

describe('useOkapiKy', () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn();
  beforeEach(() => {
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('supplies default values and reads others from stripes', () => {
    const okapi = {
      tenant: 'tenant',
      url: 'https://whatever.com',
      token: 'yes, my precious',
    };
    mockUseStripes.mockReturnValue({ okapi });

    useOkapiKy();

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      credentials: 'include',
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout: 60000,
    }));

    const args = mockKyCreate.mock.calls[0][0];

    // are hooks in place?
    args.hooks.beforeRequest.forEach(fx => fx(req));
    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', 'en');
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Token', okapi.token);

    // are fetch arguments curried onto native fetch?
    const resource = 'some-url';
    const options = { key: 'value' };
    args.fetch(resource, options);
    expect(fetchMock).toHaveBeenCalledWith(resource, expect.objectContaining({ ...options }));
  });

  it('stripes values override defaults', () => {
    const okapi = {
      locale: 'klingon',
      tenant: 'tenant',
      timeout: 2718,
      url: 'https://whatever.com'
    };

    mockUseStripes.mockReturnValue({ okapi });

    useOkapiKy();

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      credentials: 'include',
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout: okapi.timeout,
    }));

    // what happens when we exercise ky's hooks?
    const args = mockKyCreate.mock.calls[0][0];
    args.hooks.beforeRequest.forEach(fx => fx(req));

    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);
  });

  it('arguments override stripes', () => {
    const okapi = {
      locale: 'klingon',
      tenant: 'tenant',
      timeout: 2718,
      url: 'https://whatever.com'
    };

    mockUseStripes.mockReturnValue({ okapi });

    const tenant = 'avtenant';
    const timeout = 662607;
    const rtrIgnore = true;

    useOkapiKy({ tenant, timeout, rtrIgnore });

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      credentials: 'include',
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout,
    }));

    // what happens when we exercise ky's hooks?
    const args = mockKyCreate.mock.calls[0][0];
    args.hooks.beforeRequest.forEach(fx => fx(req));

    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', tenant);

    // are fetch arguments curried onto native fetch?
    // and is rtrIgnore supplied?
    const resource = 'some-url';
    const options = { key: 'value' };
    args.fetch(resource, options);
    expect(fetchMock).toHaveBeenCalledWith(
      resource,
      expect.objectContaining({ ...options, rtrIgnore })
    );
  });

  describe('when tenant param is present but empty', () => {
    it('tenant is derived from stripes', () => {
      const okapi = {
        locale: 'klingon',
        tenant: 'tenant',
        timeout: 2718,
        url: 'https://whatever.com'
      };

      mockUseStripes.mockReturnValue({ okapi });

      const tenant = '';
      const timeout = 662607;

      useOkapiKy({ tenant, timeout });

      // what happens when we exercise ky's hooks?
      const args = mockKyCreate.mock.calls[0][0];
      args.hooks.beforeRequest.forEach(fx => fx(req));

      expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
      expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);
    });
  });
});

describe('usePublicGatewayKy', () => {
  const originalFetch = globalThis.fetch;
  const fetchMock = jest.fn();
  beforeEach(() => {
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('supplies default values, reads others from stripes, includes rtrIgnore', () => {
    const okapi = {
      tenant: 'tenant',
      url: 'https://whatever.com',
      token: 'yes, my precious',
    };
    mockUseStripes.mockReturnValue({ okapi });

    usePublicGatewayKy();

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout: 60000,
    }));

    const args = mockKyCreate.mock.calls[0][0];

    // are hooks in place?
    args.hooks.beforeRequest.forEach(fx => fx(req));
    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', 'en');
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);

    // are fetch arguments curried onto native fetch?
    // and is rtrIgnore supplied?
    const resource = 'some-url';
    const options = { key: 'value' };
    args.fetch(resource, options);
    expect(fetchMock).toHaveBeenCalledWith(
      resource,
      expect.objectContaining({ ...options, rtrIgnore: true })
    );
  });

  it('stripes values override defaults', () => {
    const okapi = {
      locale: 'klingon',
      tenant: 'tenant',
      timeout: 2718,
      url: 'https://whatever.com'
    };

    mockUseStripes.mockReturnValue({ okapi });

    useOkapiKy();

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      credentials: 'include',
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout: okapi.timeout,
    }));

    // what happens when we exercise ky's hooks?
    const args = mockKyCreate.mock.calls[0][0];
    args.hooks.beforeRequest.forEach(fx => fx(req));

    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);
  });

  it('tenant and timeout arguments override stripes', () => {
    const okapi = {
      locale: 'klingon',
      tenant: 'tenant',
      timeout: 2718,
      url: 'https://whatever.com'
    };

    mockUseStripes.mockReturnValue({ okapi });

    const tenant = 'avtenant';
    const timeout = 662607;

    useOkapiKy({ tenant, timeout });

    // how was ky.create called?
    expect(mockKyCreate).toHaveBeenCalledWith(expect.objectContaining({
      credentials: 'include',
      mode: 'cors',
      prefixUrl: okapi.url,
      timeout,
    }));

    // what happens when we exercise ky's hooks?
    const args = mockKyCreate.mock.calls[0][0];
    args.hooks.beforeRequest.forEach(fx => fx(req));

    expect(req.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
    expect(req.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', tenant);
  });
});
