import { useQuery } from 'react-query';

import { useStripes } from '../StripesContext';
import { useNamespace } from '../components';
import useOkapiKy from '../useOkapiKy';

const INITIAL_DATA = [];

const useUserTenantPermissionNames = (
  { tenantId },
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

  const user = stripes.user.user;

  const searchParams = {
    full: 'true',
    indexField: 'userId',
  };

  const {
    isFetching,
    isLoading,
    data = {},
  } = useQuery(
    [namespace, user?.id, tenantId],
    ({ signal }) => {
      return api.get(
        `perms/users/${user.id}/permissions`,
        {
          searchParams,
          signal,
        },
      ).json();
    },
    {
      enabled: Boolean(user?.id && tenantId),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    isFetching,
    isLoading,
    userPermissions: data.permissionNames || INITIAL_DATA,
    totalRecords: data.totalRecords,
  });
};

export default useUserTenantPermissionNames;
