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
  mode: 'cors',
  prefixUrl: url,
  retry: 0,
  timeout: timeout || defaultTimeout,
});

/**
 * useOkapiKy
 * Construct a ky instance configured based on the given tenant, or with values
 * from stripes if none are provided
 * @param {string} tenant tenant to supply in the x-okapi-tenant header
 * @param {number} timeout API gateway timeout, in milliseconds
 * @returns ky instance
 */
export default ({ tenant, timeout, rtrIgnore = false } = {}) => {
  const {
    locale = 'en',
    tenant: currentTenant,
    timeout: defaultTimeout = 60000, // Kong has a default timeout of 60 seconds
    token,
    url,
  } = useStripes().okapi;

  const kyOptions = defaultOptions({ locale, tenant, currentTenant, timeout, defaultTimeout, url });
  return ky.create({
    ...kyOptions,
    credentials: 'include',
    // curry options on to fetch since ky <= v0.23.x does not do it for us
    // see /src/components/Root/FFetch.js for additional details.
    fetch: (request, options) => {
      return globalThis.fetch(request, { ...options, rtrIgnore });
    },
    hooks: {
      beforeRequest: [
        ...kyOptions.hooks.beforeRequest,
        (request) => {
          if (token) {
            request.headers.set('X-Okapi-Token', token);
          }
        }
      ]
    },
  });
};

/**
 * usePublicGatewayKy
 * Construct a ky instance configured for accessing publicly-available
 * endpoints. It is otherwise identical to `useOkapiKy()`, using the given
 * values or pulling them from stripes.
 *
 * @param {string} tenant tenant to supply in the x-okapi-tenant header
 * @param {number} timeout API gateway timeout, in milliseconds
 * @returns ky instance
 */
export const usePublicGatewayKy = ({ tenant, timeout } = {}) => {
  const {
    locale = 'en',
    tenant: currentTenant,
    timeout: defaultTimeout = 60000, // Kong has a default timeout of 60 seconds
    url,
  } = useStripes().okapi;

  return ky.create({
    ...defaultOptions({ locale, tenant, currentTenant, timeout, defaultTimeout, url }),
    // curry options on to fetch since ky <= v0.23.x does not do it for us
    // see /src/components/Root/FFetch.js for additional details.
    fetch: (request, options) => {
      return fetch(request, { ...options, rtrIgnore: true });
    }
  });
};
