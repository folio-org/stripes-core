import ky from 'ky';
import { useQuery } from 'react-query';

import { useStripes } from '../../../../../StripesContext';

const usePasswordRules = () => {
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

  const { data } = useQuery(
    ['requirements-list'],
    async () => {
      return kyInstance.get('tenant/rules').json();
    },
  );

  return ({
    rules: data?.rules,
  });
};

export default usePasswordRules;
