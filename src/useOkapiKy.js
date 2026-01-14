import ky from 'ky';
import { useStripes } from './StripesContext';

export default ({ tenant, timeout } = {}) => {
  // Kong has a default timeout of 60 seconds
  const { locale = 'en', timeout: defaultTimeout = 60000, tenant: currentTenant, token, url } = useStripes().okapi;

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
    timeout: timeout || defaultTimeout,
  });
};
