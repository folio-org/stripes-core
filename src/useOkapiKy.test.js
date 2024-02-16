import { renderHook } from '@folio/jest-config-stripes/testing-library/react';

import { useStripes } from './StripesContext';
import useOkapiKy from './useOkapiKy';

jest.mock('./StripesContext');
jest.mock('ky', () => ({
  create: ({ ...av }) => av,
}));

describe('useOkapiKy', () => {
  it('pulls values from stripes object', async () => {
    const okapi = {
      locale: 'klingon',
      tenant: 'tenant',
      timeout: 271828,
      url: 'https://whatever.com'
    };

    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi });

    const r = {
      headers: {
        set: jest.fn(),
      }
    };

    const { result } = renderHook(() => useOkapiKy());
    result.current.hooks.beforeRequest[0](r);

    expect(result.current.prefixUrl).toBe(okapi.url);
    expect(result.current.timeout).toBe(okapi.timeout);

    expect(r.headers.set).toHaveBeenCalledWith('Accept-Language', okapi.locale);
    expect(r.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', okapi.tenant);
  });

  it('provides default values if stripes lacks them', async () => {
    const okapi = {};

    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi });

    const r = {
      headers: {
        set: jest.fn(),
      }
    };

    const { result } = renderHook(() => useOkapiKy());
    result.current.hooks.beforeRequest[0](r);

    expect(result.current.timeout).toBe(30000);

    expect(r.headers.set).toHaveBeenCalledWith('Accept-Language', 'en');
  });

  it('overrides tenant', async () => {
    const okapi = {
      tenant: 'tenant',
      timeout: 271828,
      url: 'https://whatever.com'
    };

    const mockUseStripes = useStripes;
    mockUseStripes.mockReturnValue({ okapi });

    const r = {
      headers: {
        set: jest.fn(),
      }
    };

    const { result } = renderHook(() => useOkapiKy({ tenant: 'monkey' }));
    result.current.hooks.beforeRequest[0](r);

    expect(r.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', 'monkey');
  });

  describe('when tenant param is not null, but an empty value', () => {
    it('should use okapi tenant id', () => {
      const okapi = {
        tenant: 'tenant',
        timeout: 271828,
        url: 'https://whatever.com'
      };

      const mockUseStripes = useStripes;
      mockUseStripes.mockReturnValue({ okapi });

      const r = {
        headers: {
          set: jest.fn(),
        }
      };

      const { result } = renderHook(() => useOkapiKy({ tenant: '' }));
      result.current.hooks.beforeRequest[0](r);

      expect(r.headers.set).toHaveBeenCalledWith('X-Okapi-Tenant', 'tenant');
    });
  });
});


