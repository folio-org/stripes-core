import { useQuery } from 'react-query';

import { useStripes } from '../StripesContext';
import { useNamespace } from '../components';
import useOkapiKy from '../useOkapiKy';

const INITIAL_DATA = [];

const useUserTenantPermissionNames = (
  { userId, tenantId },
  options = {},
) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });
  const [namespace] = useNamespace({ key: 'user-affiliation-permissions' });

  const searchParams = {
    full: 'true',
    indexField: 'userId',
  };

  const {
    isFetching,
    isFetched,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, userId, tenantId],
    ({ signal }) => {
      return api.get(
        `perms/users/${userId}/permissions`,
        {
          searchParams,
          signal,
        },
      ).json();
    },
    {
      enabled: Boolean(userId && tenantId) && !stripes.hasInterface('roles'),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    isFetching,
    isFetched,
    isLoading,
    userPermissions: data.permissionNames || INITIAL_DATA,
    totalRecords: data.totalRecords,
  });
};

export default useUserTenantPermissionNames;
