import { renderHook, waitFor } from '@folio/jest-config-stripes/testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';

import useUserTenantRoles from './useUserTenantRoles';
import useOkapiKy from '../useOkapiKy';

jest.mock('../useOkapiKy');
jest.mock('../components', () => ({
  useNamespace: () => ([]),
}));
jest.mock('../StripesContext', () => ({
  useStripes: () => ({
    hasInterface: () => true,
    config: {
      maxUnpagedResourceCount: 2000
    }
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
  data: {
    roles: ['role1', 'role2'],
    totalRecords: 2,
  }
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

  it('should fetch user roles for specified tenant', async () => {
    const options = {
      userId: 'superUserId',
      tenantId: 'tenantId',
    };
    const { result } = renderHook(() => useUserTenantRoles(options), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(setHeaderMock).toHaveBeenCalledWith('X-Okapi-Tenant', options.tenantId);
    expect(getMock).toHaveBeenCalledWith('roles/users', {
      searchParams: {
        'limit':2000,
        query: 'userId==superUserId'
      }
    });
  });
});
