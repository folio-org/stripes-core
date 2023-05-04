import localforage from 'localforage';
import { okapi } from 'stripes-config';

import {
  setConsortiumData,
  setCurrentTenant,
} from './okapiActions';

/**
 * updateConsortium
 *
 * 1. concat the given data onto local-storage consortium and save it;
 * 2. dispatch setConsortiumData, concating given data onto the session consortium;
 * 3. dispatch setCurrentTenant if updates contain 'activeAffiliation'.
 *
 * @param {redux-store} store
 * @param {object} data
 *
 * @returns {void}
 */
export function updateConsortium(store, data, defaultTenant = okapi.tenant) {
  return localforage.getItem('okapiSess')
    .then((sess) => {
      sess.consortium = { ...(sess.consortium || {}), ...data };
      return localforage.setItem('okapiSess', sess);
    })
    .then(({ consortium }) => {
      store.dispatch(setConsortiumData(consortium));
      if (consortium?.activeAffiliation) store.dispatch(setCurrentTenant(consortium.activeAffiliation.tenantId || defaultTenant));
    });
}

/**
 * fetchConsortia
 *
 * Retrieve a list of consortia.
 *
 * @param {string} okapiUrl
 * @param {string} tenant
 *
 * @returns {Promise}
 */
export const fetchConsortia = (okapiUrl, tenant) => {
  return fetch(`${okapiUrl}/consortia`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * fetchConsortiumTenants
 *
 * Retrieve a list of tenants related to the specified consortium.
 *
 * @param {string} okapiUrl
 * @param {string} tenant
 * @param {Object} options
 * @param {string} options.consortiumId
 *
 * @returns {Promise}
 */
export const fetchConsortiumTenants = (okapiUrl, tenant, { consortiumId }) => {
  return fetch(`${okapiUrl}/consortia/${consortiumId}/tenants`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * fetchConsortiumTenants
 *
 * Retrieve a list of affiliations between users and tenants in the specified consortium.
 *
 * @param {string} okapiUrl
 * @param {string} tenant
 * @param {string} token
 * @param {Object} options
 * @param {string} options.consortiumId
 * @param {string} options.userId
 *
 * @returns {Promise}
 */
export const fetchConsortiumUserAffiliations = (okapiUrl, tenant, token, { consortiumId, userId }) => {
  return fetch(`${okapiUrl}/consortia/${consortiumId}/user-tenants?userId=${userId}`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'X-Okapi-Token': token,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * fetchCurrentConsortiumData
 *
 * 1. Fetch data related to current consortium;
 * 2. Update consortium in okapi session;
 * 3. Update current tenant.
 *
 * @param {redux-store} store
 * @param {object} data
 *
 * @returns {void}
 */
export const fetchCurrentConsortiumData = (store, data) => {
  const centralTenant = okapi.tenant;
  const { token, url } = store.getState().okapi;

  return fetchConsortia(url, centralTenant)
    .then(resp => resp.json().then(json => (json.totalRecords ? json.consortia[0] : {})))
    .then(consortium => {
      const consortiumId = consortium.id;

      if (!consortiumId) return Promise.resolve();

      return Promise.all([
        fetchConsortiumTenants(
          url,
          centralTenant,
          { consortiumId },
        ).then(resp => resp.json()),
        fetchConsortiumUserAffiliations(
          url,
          centralTenant,
          token,
          { consortiumId, userId: data.user.id },
        ).then(resp => resp.json()),
      ]).then(([consortiumTenants, userAffiliations]) => ({
        consortium,
        consortiumTenants,
        userAffiliations,
      }));
    })
    .then(resolved => {
      if (!resolved) return Promise.resolve();

      const {
        consortium,
        consortiumTenants,
        userAffiliations,
      } = resolved;
      const primaryAffiliation = userAffiliations?.userTenants?.find(({ isPrimary }) => Boolean(isPrimary));

      const consortiumData = {
        ...consortium,
        tenants: consortiumTenants?.tenants,
        centralTenant,
        activeAffiliation: primaryAffiliation,
        userPrimaryTenant: primaryAffiliation?.tenantId,
        userAffiliations: userAffiliations?.userTenants,
      };

      updateConsortium(store, consortiumData, centralTenant);

      return consortiumData;
    })
    .catch((e) => {
      console.error('Failed to load consortium data', e);
    });
};
