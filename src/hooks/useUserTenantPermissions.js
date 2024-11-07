import { useStripes } from '../StripesContext';
import useUserTenantPermissionNames from './useUserTenantPermissionNames';
import useUserTenantRoles from './useUserTenantRoles';

const useUserTenantPermissions = (
  { tenantId, userId },
  options = {},
) => {
  const stripes = useStripes();

  const {
    isFetching: isPermissionsFetching,
    isFetched: isPermissionsFetched,
    isLoading: isPermissionsLoading,
    userPermissions: permissionsData,
    totalRecords: permissionsTotalRecords
  } = useUserTenantPermissionNames({ tenantId, userId }, options);

  const {
    isFetching: isRolesFetching,
    isFetched: isRolesFetched,
    isLoading: isRolesLoading,
    userPermissions:userRolesData,
    totalRecords: userRolesTotalRecords
  } = useUserTenantRoles({ tenantId, userId }, options);

  const isFetching = stripes.hasInterface('roles') ? isRolesFetching : isPermissionsFetching;
  const isFetched = stripes.hasInterface('roles') ? isRolesFetched : isPermissionsFetched;
  const isLoading = stripes.hasInterface('roles') ? isRolesLoading : isPermissionsLoading;
  const userPermissions = stripes.hasInterface('roles') ? userRolesData : permissionsData;
  const totalRecords = stripes.hasInterface('roles') ? userRolesTotalRecords : permissionsTotalRecords;

  return ({
    isFetching,
    isFetched,
    isLoading,
    userPermissions,
    totalRecords
  });
};

export default useUserTenantPermissions;
