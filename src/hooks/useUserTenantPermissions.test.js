import { renderHook } from '@folio/jest-config-stripes/testing-library/react';
import { useStripes } from '../StripesContext';
import useUserSelfTenantPermissions from './useUserSelfTenantPermissions';
import useUserTenantPermissionNames from './useUserTenantPermissionNames';
import useUserTenantPermissions from './useUserTenantPermissions';

jest.mock('../StripesContext');
jest.mock('./useUserSelfTenantPermissions');
jest.mock('./useUserTenantPermissionNames');

describe('useUserTenantPermissions', () => {
  const tenantId = 'tenant-id';
  const options = {};

  beforeEach(() => {
    useStripes.mockReturnValue({
      hasInterface: jest.fn()
    });
  });

  it('should return _self permissions data when "roles" interface is present', () => {
    useStripes().hasInterface.mockReturnValue(true);

    useUserSelfTenantPermissions.mockReturnValue({
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

    useUserSelfTenantPermissions.mockReturnValue({
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
