import { useStripes } from '../StripesContext';
import useUserSelfTenantPermissions from './useUserSelfTenantPermissions';
import useUserTenantPermissionNames from './useUserTenantPermissionNames';

const useUserTenantPermissions = (
  { tenantId },
  options = {},
) => {
  const stripes = useStripes();

  const {
    isFetching: isPermissionsFetching,
    isLoading: isPermissionsLoading,
    userPermissions: permissionsData = {},
    totalRecords: permissionsTotalRecords
  } = useUserTenantPermissionNames({ tenantId }, options);

  const {
    isFetching: isSelfPermissionsFetching,
    isLoading: isSelfPermissionsLoading,
    userPermissions:selfPermissionsData = {},
    totalRecords: selfPermissionsTotalRecords
  } = useUserSelfTenantPermissions({ tenantId }, options);

  const isFetching = stripes.hasInterface('roles') ? isSelfPermissionsFetching : isPermissionsFetching;
  const isLoading = stripes.hasInterface('roles') ? isSelfPermissionsLoading : isPermissionsLoading;
  const userPermissions = stripes.hasInterface('roles') ? selfPermissionsData : permissionsData;
  const totalRecords = stripes.hasInterface('roles') ? selfPermissionsTotalRecords : permissionsTotalRecords;

  return ({
    isFetching,
    isLoading,
    userPermissions,
    totalRecords
  });
};

export default useUserTenantPermissions;
