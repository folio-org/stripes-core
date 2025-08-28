import { getLoginTenant, isStorageEnabled } from './App';

const storageMock = () => ({
  getItem: () => {
    throw new Error();
  },
});

describe('isStorageEnabled', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true when all storage options are enabled', () => {
    expect(isStorageEnabled()).toBeTrue;
  });

  describe('returns false when any storage option is disabled', () => {
    it('handles local storage', () => {
      Object.defineProperty(window, 'localStorage', { value: storageMock });
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });
    it('handles session storage', () => {
      Object.defineProperty(window, 'sessionStorage', { value: storageMock });
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });

    it('handles cookies', () => {
      jest.spyOn(navigator, 'cookieEnabled', 'get').mockReturnValue(false);
      const isEnabled = isStorageEnabled();
      expect(isEnabled).toBeFalse;
    });
  });
});

describe('getLoginTenant', () => {
  it('uses URL values when present', () => {
    const search = { tenant: 't', client_id: 'c' };
    Object.defineProperty(window, 'location', { value: { search } });

    const res = getLoginTenant({}, {});
    expect(res.tenant).toBe(search.tenant);
    expect(res.clientId).toBe(search.client_id);
  });

  describe('single-tenant', () => {
    it('uses config.tenantOptions values when URL values are absent', () => {
      const config = {
        tenantOptions: {
          denzel: { name: 'denzel', clientId: 'nolan' }
        }
      };

      const res = getLoginTenant({}, config);
      expect(res.tenant).toBe(config.tenantOptions.denzel.name);
      expect(res.clientId).toBe(config.tenantOptions.denzel.clientId);
    });

    it('uses okapi.tenant and okapi.clientId when config.tenantOptions is missing', () => {
      const okapi = {
        tenant: 't',
        clientId: 'c',
      };

      const res = getLoginTenant(okapi, {});
      expect(res.tenant).toBe(okapi.tenant);
      expect(res.clientId).toBe(okapi.clientId);
    });

    it('returns undefined when all options are exhausted', () => {
      const res = getLoginTenant({}, {});
      expect(res.tenant).toBeUndefined();
      expect(res.clientId).toBeUndefined();
    });
  });

  describe('ECS', () => { });
});
