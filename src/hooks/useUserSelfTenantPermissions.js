import { useQuery } from 'react-query';

import { useStripes } from '../StripesContext';
import { useNamespace } from '../components';
import useOkapiKy from '../useOkapiKy';

const INITIAL_DATA = [];

const useUserSelfTenantPermissions = (
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
  const [namespace] = useNamespace({ key: 'user-self-permissions' });

  const {
    isFetching,
    isFetched,
    isLoading,
    data,
  } = useQuery(
    [namespace, userId, tenantId],
    ({ signal }) => {
      return api.get(
        'users-keycloak/_self',
        { signal },
      ).json();
    },
    {
      enabled: Boolean(userId && tenantId) && stripes.hasInterface('users-keycloak'),
      keepPreviousData: true,
      ...options,
    },
  );

  return ({
    isFetching,
    isFetched,
    isLoading,
    userPermissions: data?.permissions.permissions || INITIAL_DATA,
    totalRecords: data?.permissions.permissions.length || 0,
  });
};

export default useUserSelfTenantPermissions;
