import ky from 'ky';
import { useStripes } from './StripesContext';

export default () => {
  const { tenant, token, url } = useStripes().okapi;
  return ky.create({
    prefixUrl: url,
    hooks: {
      beforeRequest: [
        request => {
          request.headers.set('X-Okapi-Tenant', tenant);
          request.headers.set('X-Okapi-Token', token);
        }
      ]
    }
  });
};
