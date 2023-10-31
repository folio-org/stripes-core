import ky from 'ky';
import { useStripes } from './StripesContext';

export default () => {
  const { locale = 'en', timeout = 30000, tenant, url } = useStripes().okapi;

  return ky.create({
    credentials: 'include',
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant);
        }
      ]
    },
    mode: 'cors',
    prefixUrl: url,
    retry: 0,
    timeout,
  });
};
