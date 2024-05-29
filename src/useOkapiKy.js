import ky from 'ky';
import { useStripes } from './StripesContext';

export default ({ tenant } = {}) => {
  const { locale = 'en', timeout = 30000, tenant: currentTenant, token, url } = useStripes().okapi;

  return ky.create({
    credentials: 'include',
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant || currentTenant);
          if (token) {
            request.headers.set('X-Okapi-Token', token);
          }
        }
      ]
    },
    mode: 'cors',
    prefixUrl: url,
    retry: 0,
    timeout,
  });
};
