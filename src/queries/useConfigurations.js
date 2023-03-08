import { useQuery } from 'react-query';

import queryLimit from '../queryLimit';
import useOkapiKy from '../useOkapiKy';
import { useStripes } from '../StripesContext';


export const configurationsApi = (module, configName, code) => {
  const params = [];
  if (module) {
    params.push(`module=="${module}"`);
  }
  if (configName) {
    params.push(`configName=="${configName}"`);
  }
  if (code) {
    params.push(`code=="${code}"`);
  }

  const query = params.length ? `query=(${params.join(' and ')})` : '';

  return `configurations/entries?${query}&limit=${queryLimit()}`;
};

const useConfigurations = ({ module, configName, code }) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const namespace = '@folio/stripes-core:QUERY_KEY_CONFIGURATIONS';

  const { isFetching, data, error } = useQuery(
    [namespace, configName, code],
    () => {
      if (stripes.hasPerm('configuration.entries.collection.get')) {
        return ky.get(configurationsApi(module, configName, code))
          .json();
      }
      throw new Error('missing permission: configuration.entries.collection.get');
    },
  );

  return ({
    data,
    isLoading: isFetching,
    error,
  });
};

export default useConfigurations;
