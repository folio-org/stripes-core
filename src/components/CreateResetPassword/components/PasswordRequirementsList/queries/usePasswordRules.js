import ky from 'ky';
import { useQuery } from 'react-query';
import queryString from 'query-string';

import { useStripes } from '../../../../../StripesContext';

const usePasswordRules = (rulesLimit) => {
  console.log('Inside usePasswordRules() rulesLimit - ', rulesLimit);
  const { locale = 'en', tenant, url } = useStripes().okapi;
  console.log('locale, tenant, url - ', locale, tenant, url);

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
  console.log('kyInstance - ', kyInstance);
  console.log('kyInstance.get - ', kyInstance.get('tenant/rules?limit=100'));

  const searchParams = {
    limit: rulesLimit,
  };

  const { data } = useQuery(
    ['requirements-list'],
    async () => {
      return kyInstance.get(`tenant/rules?${queryString.stringify(searchParams)}`).json();
    },
  );

  console.log('usePasswordRules() data output - ', data);

  return ({
    rules: data?.rules,
  });
};

export default usePasswordRules;
