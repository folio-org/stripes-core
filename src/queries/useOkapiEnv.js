import { useQuery } from 'react-query';

import useOkapiKy from '../useOkapiKy';
import { useStripes } from '../StripesContext';

const OKAPI_ENV_API = '_/env';

const useOkapiEnv = () => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const namespace = '@folio/stripes-core:QUERY_KEY_OKAPI_ENV';

  const { isFetching, data, error } = useQuery(
    [namespace],
    () => {
      if (stripes.hasPerm('okapi.env.list')) {
        return ky.get(OKAPI_ENV_API).json();
      }

      throw new Error('missing permissions: okapi.env.list');
    },
  );

  // transform the array of { name, value} objects to a set
  const hash = {};
  if (Array.isArray(data)) {
    data.forEach(i => {
      hash[i.name] = i.value;
    });
  }

  return ({
    data: hash,
    isLoading: isFetching,
    error,
  });
};

export default useOkapiEnv;
