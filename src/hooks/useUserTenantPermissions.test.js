import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '../StripesContext';
import useUserTenantPermissionNames from './useUserTenantPermissionNames';
import useUserTenantPermissions from './useUserTenantPermissions';
import useUserTenantRoles from './useUserTenantRoles';

jest.mock('../StripesContext');
jest.mock('./useUserTenantRoles');
jest.mock('./useUserTenantPermissionNames');

describe('useUserTenantPermissions', () => {
  const tenantId = 'tenant-id';
  const options = {};

  beforeEach(() => {
    useStripes.mockReturnValue({
      hasInterface: jest.fn(),
      user:{
        user: {
          id: 'userId'
        }
      }
    });
  });

  it('should return _self permissions data when "roles" interface is present', () => {
    useStripes().hasInterface.mockReturnValue(true);

    useUserTenantRoles.mockReturnValue({
      isFetching: true,
      isFetched: true,
      isLoading: true,
      userPermissions: ['self'],
      totalRecords: 1
    });

    useUserTenantPermissionNames.mockReturnValue({
      isFetching: false,
      isFetched: false,
      isLoading: false,
      userPermissions: ['permission name'],
      totalRecords: 1
    });

    const { result } = renderHook(() => useUserTenantPermissions({ tenantId }, options));

    expect(result.current).toStrictEqual({
      isFetching: true,
      isFetched: true,
      isLoading: true,
      userPermissions: ['self'],
      totalRecords: 1
    });
  });

  it('should return tenant permissions data when "roles" interface is NOT present', () => {
    useStripes().hasInterface.mockReturnValue(false);

    useUserTenantRoles.mockReturnValue({
      isFetching: true,
      isFetched: true,
      isLoading: true,
      userPermissions: ['self'],
      totalRecords: 1
    });

    useUserTenantPermissionNames.mockReturnValue({
      isFetching: false,
      isFetched: false,
      isLoading: false,
      userPermissions: ['permission name'],
      totalRecords: 1
    });

    const { result } = renderHook(() => useUserTenantPermissions({ tenantId }, options));

    expect(result.current).toStrictEqual({
      isFetching: false,
      isFetched: false,
      isLoading: false,
      userPermissions: ['permission name'],
      totalRecords: 1
    });
  });
});
