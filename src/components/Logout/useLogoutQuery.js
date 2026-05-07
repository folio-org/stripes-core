import { useQuery, useQueryClient } from 'react-query';
import localforage from 'localforage';

import { useStripes } from '../../StripesContext';
import {
  clearCurrentUser,
  clearOkapiToken,
  setIsAuthenticated,
} from '../../okapiActions';
import { resetStore } from '../../mainActions';
import { stripesHubAPI } from '../../constants';
import {
  getLogoutTenant,
  SESSION_NAME,
  TENANT_LOCAL_STORAGE_KEY,
} from '../../loginServices';
import {
  RTR_TIMEOUT_EVENT
} from '../Root/constants';
import useOkapiKy from '../../useOkapiKy';

/**
 * clearSessionStorage
 * Clear shared storage (localStorage, localForage) that is shared across
 * tabs, and clear private storage (sessionStorage, redux, react-query,
 * session timers) that is unique per-tab and therefore must be cleared
 * in each instance of stripes, i.e. in each tab.
 *
 * @param {object} redux store
 * @param {object} queryClient react-query client
 * @param {array} timers FLST and IST timers
 *
 * @returns {Promise}
 */
export async function clearSessionStorage(store, queryClient, timers) {
  try {
    const { config } = store.getState();

    // clear the console unless config asks to preserve it
    if (!config.preserveConsole) {
      console.clear(); // eslint-disable-line no-console
    }

    // make sure timers don't fire after the session has terminated.
    // who remembers UICHKOUT-869?
    timers.forEach(timer => timer?.clear());

    // clear private-storage, including redux store and react-query
    store.dispatch(setIsAuthenticated(false));
    store.dispatch(clearCurrentUser());
    store.dispatch(clearOkapiToken());
    store.dispatch(resetStore());
    if (queryClient) {
      queryClient.removeQueries();
    }

    // clear shared storage
    // localStorage events emit across tabs so we can use it like a
    // BroadcastChannel to communicate with all tabs/windows
    localStorage.removeItem(SESSION_NAME);
    localStorage.removeItem(RTR_TIMEOUT_EVENT);
    localStorage.removeItem(TENANT_LOCAL_STORAGE_KEY);
    localStorage.removeItem(stripesHubAPI.FOLIO_CONFIG_KEY);
    localStorage.removeItem(stripesHubAPI.BRANDING_CONFIG_KEY);

    await localforage.removeItem(SESSION_NAME);
    await localforage.removeItem('loginResponse');
    await localforage.removeItem(stripesHubAPI.DISCOVERY_URL_KEY);
    await localforage.removeItem(stripesHubAPI.HOST_URL_KEY);
    await localforage.removeItem(stripesHubAPI.REMOTE_LIST_KEY);
  } catch (e) {
    console.error('error during logout', e); // eslint-disable-line no-console
  }
}

/**
 * useLogoutQuery
 * logout is basically a two-part process:
 * 1. Terminate the session on the server side by making an API call to
 *    /authn/logout, destroying the server's session and the browser's cookies.
 *    This API call will fail if attempted multiple times because the first
 *    call will destroy the cookies, guaranteeing subsequent calls will fail.
 * 2. Clear storage on the browser side. There are two parts to this:
 *    a. Clear shared storage (localStorage, localforage). Clearing shared
 *       storage across all tabs is fine, if pointless.
 *    b. Clear private storage (sessionStorage, redux, query-client, timers).
 *       Private storage **must be cleared in every single tab.
 *
 * This function takes some minor precautions to avoid repeated calling the
 * logout API, but also proceeds to clear storage regardless of the success or
 * failure of that call.
 *
 * @param {Array} timers
 * @returns
 */
export const useLogoutQuery = (timers) => {
  const queryClient = useQueryClient();
  const { store, okapi } = useStripes();

  // The tenant in x-okapi-header needs to match that provided in the AT for
  // the API call to succeed. Switching affiliations in an ECS environment
  // changes the tenant stored in stripes.okapi.tenant, so we look for the
  // tenant first in getLogoutTenant (where ECS envs store it on login) and
  // fallback to stripes.okapi.tenant.
  const ky = useOkapiKy({ tenant: getLogoutTenant()?.tenantId || okapi?.tenant });

  const logoutQuery = useQuery({
    queryKey: ['@folio/stripes-core', 'authn/logout'],
    queryFn: async () => {
      // check the shared-storage sentinel: if logout has already started
      // in another window, there is no value in running this query again
      // because the second time (now that cookies were destroyed) it is
      // guaranteed to return 4xx. if we run it accidentally, trap any errors
      // to make sure we can still proceed with clearing storage.
      if (localStorage.getItem(SESSION_NAME)) {
        try {
          await ky.post('authn/logout');
        } catch (err) {
          console.log({ err }); // eslint-disable-line no-console
        }
      }

      await clearSessionStorage(store, queryClient, timers);
    },
    retry: false,
  });

  return { logoutQuery };
};
