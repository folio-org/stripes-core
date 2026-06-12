import { useQuery } from 'react-query';

import { usePublicGatewayKy } from '../../../../../useOkapiKy';

const usePasswordRules = (rulesLimit) => {
  const ky = usePublicGatewayKy();
  const searchParams = {
    limit: rulesLimit,
  };

  const { data } = useQuery(
    ['requirements-list'],
    async () => {
      return ky.get('tenant/rules', { searchParams }).json();
    },
  );

  return ({
    rules: data?.rules,
  });
};

export default usePasswordRules;
