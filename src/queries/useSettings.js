import {
  useQuery,
  useMutation,
} from 'react-query';

import {
  useTenantPreferences,
  usePreferences,
} from '../hooks';
import { useStripes } from '../StripesContext';

const DEFAULT_SETTINGS = {};

const useSettings = ({ scope, key, userId }) => {
  const stripes = useStripes();
  const tenantId = stripes.okapi.tenant;

  const {
    setTenantPreference,
    getTenantPreference,
    removeTenantPreference,
  } = useTenantPreferences();

  const {
    setPreference,
    getPreference,
    removePreference,
  } = usePreferences();

  const { data, isLoading, refetch } = useQuery(
    ['settings', userId, tenantId, scope, key],
    () => {
      if (userId) {
        return getPreference({ scope, key, userId });
      }

      return getTenantPreference({ scope, key });
    },
    {
      keepPreviousData: false,
    }
  );

  const { mutateAsync } = useMutation(
    (value) => {
      if (userId) {
        return setPreference({ scope, key, value });
      }

      return setTenantPreference({ scope, key, value });
    },
    {
      onSuccess: () => {
        refetch();
      },
    },
  );

  const { mutateAsync: deleteSetting } = useMutation(
    () => {
      if (userId) {
        return removePreference({ scope, key });
      }

      return removeTenantPreference({ scope, key });
    },
    {
      onSuccess: () => {
        refetch();
      },
    },
  );

  return {
    settings: data || DEFAULT_SETTINGS,
    isLoading,
    updateSetting: mutateAsync,
    removeSetting: deleteSetting,
  };
};

export default useSettings;
