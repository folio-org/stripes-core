import localforage from 'localforage';
import { okapi } from 'stripes-config';

import {
  setConsortiumData,
  setCurrentTenant,
} from './okapiActions';

// TODO: update docs comment
/**
 * updateConsortium
 * 1. concat the given data onto consortium state
 * 2. dispatch setConsortiumData, concating given data onto the consortium state
 * @param {redux-store} store redux store
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

// TODO: add docs comments

export const fetchCurrentConsortium = (okapiUrl, tenant) => {
  return fetch(`${okapiUrl}/consortia`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'Content-Type': 'application/json',
    },
  });
};

export const fetchConsortiumTenants = (okapiUrl, tenant, { consortiumId }) => {
  return fetch(`${okapiUrl}/consortia/${consortiumId}/tenants`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'Content-Type': 'application/json',
    },
  });
};

export const fetchConsortiumUserAffiliations = (okapiUrl, tenant, token, { consortiumId, userId }) => {
  return fetch(`${okapiUrl}/consortia/${consortiumId}/user-tenants?userId=${userId}`, {
    headers: {
      'X-Okapi-Tenant': tenant,
      'X-Okapi-Token': token,
      'Content-Type': 'application/json',
    },
  });
};

// TODO: test for both consortia and non-consortia tenants
export const fetchCurrentConsortiumData = (store, data) => {
  const centralTenant = okapi.tenant;
  const { token, url } = store.getState().okapi;

  return fetchCurrentConsortium(url, centralTenant)
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
