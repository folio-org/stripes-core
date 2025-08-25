import { useQuery } from 'react-query';

import { useStripes } from '../StripesContext';
import { useNamespace } from '../components';
import useOkapiKy from '../useOkapiKy';

const INITIAL_DATA = [];

const useUserTenantPermissions = (
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
  const [namespace] = useNamespace({ key: 'user-self-permissions' });

  const permPath = stripes.hasInterface('users-keycloak') ? 'users-keycloak' : 'bl-users';

  const {
    isFetching,
    isFetched,
    isLoading,
    data,
  } = useQuery(
    [namespace, tenantId],
    ({ signal }) => {
      return api.get(
        `${permPath}/_self?expandPermissions=true`,
        { signal },
      ).json();
    },
    {
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

export default useUserTenantPermissions;
