import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import permissions from 'fixtures/permissions';
import useUserSelfTenantPermissions from './useUserSelfTenantPermissions';
import useOkapiKy from '../useOkapiKy';

jest.mock('../useOkapiKy');
jest.mock('../components', () => ({
  useNamespace: () => ([]),
}));
jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    hasInterface: () => true
  }),
}));

const queryClient = new QueryClient();

// eslint-disable-next-line react/prop-types
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

const response = {
  permissions: { permissions },
};

describe('useUserSelfTenantPermissions', () => {
  const getMock = jest.fn(() => ({
    json: () => Promise.resolve(response),
  }));
  const setHeaderMock = jest.fn();
  const kyMock = {
    extend: jest.fn(({ hooks: { beforeRequest } }) => {
      beforeRequest.forEach(handler => handler({ headers: { set: setHeaderMock } }));

      return {
        get: getMock,
      };
    }),
  };

  beforeEach(() => {
    getMock.mockClear();
    useOkapiKy.mockClear().mockReturnValue(kyMock);
  });

  it('should fetch user permissions for specified tenant', async () => {
    const options = {
      tenantId: 'tenantId',
    };
    const { result } = renderHook(() => useUserSelfTenantPermissions(options), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(setHeaderMock).toHaveBeenCalledWith('X-Okapi-Tenant', options.tenantId);
    expect(getMock).toHaveBeenCalledWith('users-keycloak/_self?expandPermissions=true', expect.objectContaining({}));
  });
});
