import ky from 'ky';
import { useStripes } from './StripesContext';

/**
 * defaultOptions
 *
 * @param {object} param0
 * @returns
 */
const defaultOptions = ({ locale, tenant, currentTenant, timeout, defaultTimeout, url }) => ({
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set('Accept-Language', locale);
      },
      (request) => {
        request.headers.set('X-Okapi-Tenant', tenant || currentTenant);
      },
    ]
  },
  prefixUrl: url,
  retry: 0,
  timeout: timeout || defaultTimeout,
});

/**
 * useOkapiKy
 * Construct a ky instance configured based on the given tenant, or one pulled
 * @param {object} param0
 * @returns
 */
export const useOkapiKy = ({ tenant, timeout } = {}) => {
  // Kong has a default timeout of 60 seconds
  const {
    locale = 'en',
    timeout: defaultTimeout = 60000,
    tenant: currentTenant,
    token,
    url,
  } = useStripes().okapi;

  const options = defaultOptions({ locale, tenant, currentTenant, timeout, defaultTimeout, url });
  return ky.create({
    ...options,
    credentials: 'include',
    hooks: {
      beforeRequest: [
        ...options.hooks.beforeRequest,
        (request) => {
          if (token) {
            request.headers.set('X-Okapi-Token', token);
          }
        }

      ]
    },
    mode: 'cors',
  });
};

export default useOkapiKy;

export const useUnauthenticatedOkapiKy = ({ tenant, timeout } = {}) => {
  // Kong has a default timeout of 60 seconds
  const {
    locale = 'en',
    timeout: defaultTimeout = 60000,
    tenant: currentTenant,
    url,
  } = useStripes().okapi;

  return ky.create({
    ...defaultOptions({ locale, tenant, currentTenant, timeout, defaultTimeout, url }),
    fetch: globalThis.unauthenticatedFetch,
  });
};

