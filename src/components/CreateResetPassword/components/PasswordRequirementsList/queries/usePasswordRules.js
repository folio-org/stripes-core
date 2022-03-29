import ky from 'ky';
import { useQuery } from 'react-query';
import queryString from 'query-string';

import { useStripes } from '../../../../../StripesContext';

const usePasswordRules = (rulesLimit) => {
  const { locale = 'en', tenant, url } = useStripes().okapi;

  const kyInstance = ky.create({
    prefixUrl: url,
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant);
        }
      ]
    },
    retry: 0,
    timeout: 30000,
  });

  const searchParams = {
    limit: rulesLimit,
  };

  const { data } = useQuery(
    ['requirements-list'],
    async () => {
      return kyInstance.get(`tenant/rules?${queryString.stringify(searchParams)}`).json();
    },
  );

  return ({
    rules: data?.rules,
  });
};

export default usePasswordRules;
