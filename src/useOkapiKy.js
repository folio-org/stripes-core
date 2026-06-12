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
export default ({ tenant, timeout } = {}) => {
  const {
    locale = 'en',
    tenant: currentTenant,
    timeout: defaultTimeout = 60000, // Kong has a default timeout of 60 seconds
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
    // note that `ky.get(input, options)` DOES NOT directly correspond to
    // a call like `fetch(input, options)`. It ends up being analogous to
    //   fetch(new Request(input, options), undefined);
    // Because our globalThis.fetch replacement relies on receiving custom
    // values via options (namely, `rtrIgnore`, which is used to suppress RTR
    // checks when calling publicly available routes), we need this hook to
    // curry ky's options onto fetch's options.
    //
    // Newer versions of ky support this, e.g. allowing calls such as
    //   api.get(resource, { rtrIgnore: true });
    // but at least as of ky v0.23.0, it does not work this way, and so this
    // hook is necessary.
    //
    // see /src/components/Root/FFetch.js for additional details.
    fetch: (resource, options) => {
      return fetch(resource, { ...options, rtrIgnore: true });
    }
  });
};
