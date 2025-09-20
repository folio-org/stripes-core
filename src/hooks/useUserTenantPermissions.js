import { useQuery } from 'react-query';
import { useState, useEffect } from 'react';

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
  const [permPath, setPermPath] = useState('bl-users');

  // Determine permission path asynchronously
  useEffect(() => {
    const determinePermPath = async () => {
      try {
        const hasKeycloak = await stripes.hasInterface('users-keycloak');
        setPermPath(hasKeycloak ? 'users-keycloak' : 'bl-users');
      } catch (error) {
        console.error('Failed to check users-keycloak interface:', error);
        setPermPath('bl-users'); // fallback
      }
    };

    determinePermPath();
  }, [stripes]);

  const {
    isFetching,
    isFetched,
    isLoading,
    data,
  } = useQuery(
    [namespace, tenantId, permPath], // Include permPath in dependency array
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
