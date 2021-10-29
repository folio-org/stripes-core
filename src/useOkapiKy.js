import ky from 'ky';
import { useStripes } from './StripesContext';

export default () => {
  const { locale = 'en', tenant, token, url } = useStripes().okapi;
  return ky.create({
    prefixUrl: url,
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('Accept-Language', locale);
          request.headers.set('X-Okapi-Tenant', tenant);
          request.headers.set('X-Okapi-Token', token);
        }
      ]
    },
    retry: 0,
    timeout: 30000,
  });
};
