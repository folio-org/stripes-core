import ky from 'ky';
import { useStripes } from './StripesContext';

export default () => {
  const { locale = 'en', tenant, url } = useStripes().okapi;
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
    prefix: url,
    retry: 0,
    timeout: 30000,
  });
};
