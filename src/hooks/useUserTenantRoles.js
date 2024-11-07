import { useQuery } from 'react-query';
import { useStripes } from '../StripesContext';
import useOkapiKy from '../useOkapiKy';
import { useNamespace } from '../components';

const INITIAL_DATA = [];

function useUserTenantRoles({ userId, tenantId }, options) {
  const stripes = useStripes();

  const searchParams = {
    limit: stripes.config.maxUnpagedResourceCount,
    query: `userId==${userId}`,
  };
  const ky = useOkapiKy();
  const api = ky.extend({
    hooks: {
      beforeRequest: [(req) => req.headers.set('X-Okapi-Tenant', tenantId)]
    }
  });
  const [namespace] = useNamespace({ key: 'user-roles' });

  const { data, isLoading, isFetched, isFetching } = useQuery([namespace, userId], () => {
    return api.get(
      'roles/users', { searchParams },
    )
      .json();
  }, { enabled: !!userId && !!tenantId && stripes.hasInterface('roles'), ...options });

  return {
    isFetching,
    isFetched,
    isLoading,
    userPermissions: data.roles || INITIAL_DATA,
    totalRecords: data.totalRecords || 0
  };
}

export default useUserTenantRoles;
