import ky from 'ky';
import { useStripes } from './StripesContext';

export default ({ tenant } = {}) => {
  const { locale = 'en', timeout = 30000, tenant: currentTenant, url } = useStripes().okapi;

  return ky.create({
    credentials: 'include',
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant ?? currentTenant);
        }
      ]
    },
    mode: 'cors',
    prefixUrl: url,
    retry: 0,
    timeout,
  });
};
