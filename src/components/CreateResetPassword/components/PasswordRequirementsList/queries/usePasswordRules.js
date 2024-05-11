import { useQuery } from 'react-query';
import { useOkapiKy } from '@folio/stripes-core';
import queryString from 'query-string';

import { useStripes } from '../../../../../StripesContext';

const usePasswordRules = (rulesLimit) => {
  console.log('Inside usePasswordRules() rulesLimit - ', rulesLimit);

  const { locale = 'en', tenant, url } = useStripes().okapi;
  const ky = useOkapiKy();

  console.log('locale, tenant, url - ', locale, tenant, url);


  const api = ky.extend({
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

  console.log('ky - ', api);
  console.log('ky.get() - ', api.get(`tenant/rules?${queryString.stringify(searchParams)}`));
  console.log('ky.get().json response - ', api.get(`tenant/rules?${queryString.stringify(searchParams)}`).json());

  const { data } = useQuery(
    ['requirements-list'],
    async () => {
      return api.get(`tenant/rules?${queryString.stringify(searchParams)}`).json();
    },
  );

  console.log('usePasswordRules() data output - ', data);

  return ({
    rules: data?.rules,
  });
};

export default usePasswordRules;
