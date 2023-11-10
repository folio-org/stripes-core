import ky from 'ky';
import { useStripes } from './StripesContext';

export default ({ tenant } = {}) => {
  const { locale = 'en', timeout = 30000, tenant: currentTenant, token, url } = useStripes().okapi;

  return ky.create({
    prefixUrl: url,
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant ?? currentTenant);
          request.headers.set('X-Okapi-Token', token);
        }
      ]
    },
    retry: 0,
    timeout,
  });
};
