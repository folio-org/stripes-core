import { useMutation, useQueryClient } from 'react-query';
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
  getLoginTenant,
  getLogoutTenant,
  SESSION_NAME,
  TENANT_LOCAL_STORAGE_KEY,
} from '../../loginServices';
import {
  RTR_TIMEOUT_EVENT
} from '../Root/constants';
import useOkapiKy from '../../useOkapiKy';
import { SessionSyncError } from '../SessionSyncError';

/**
 * clearSharedStorage
 * Clear shared storage (localStorage, localForage) that is shared across
 * tabs.
 */
export const clearSharedStorage = async () => {
  // localStorage
  // IndexedDB / localForage
  try {
    // clear shared storage
    // localStorage events emit across tabs so we can use it like a
    // BroadcastChannel to communicate with all tabs/windows.
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
    console.error('logout error during logout', e); // eslint-disable-line no-console
  }
};

/**
 * clearPrivateStorage
 * Clear tab-specific storage (sessionStorage, redux, react-query,
 * session timers) that is unique per-tab and therefore must be cleared
 * in each instance of stripes, i.e. in each tab.
 *
 * @param {object} store redux store
 * @param {object} queryClient react-query client
 * @param {array} timers FLST and IST timers
 */
export const clearPrivateStorage = (store, queryClient, timers) => {
  try {
    // clear the console unless config asks to preserve it
    const { config } = store.getState();
    if (!config.preserveConsole) {
      console.clear(); // eslint-disable-line no-console
    }

    // clear private-storage, including redux store and react-query
    store.dispatch(setIsAuthenticated(false));
    store.dispatch(clearCurrentUser());
    store.dispatch(clearOkapiToken());
    store.dispatch(resetStore());

    if (queryClient) {
      queryClient.removeQueries();
    }

    // make sure timers don't fire after the session has terminated.
    // who remembers UICHKOUT-869?
    timers.forEach(timer => timer?.clear());

    sessionStorage.clear();
  } catch (e) {
    console.error('error during logout', e); // eslint-disable-line no-console
  }
};

/**
 * useLogoutMutation
 * This function always does two things:
 * 1. it calls /authn/logout, expecting to destroy cookies, causing both the
 *    API Gateway (Kong or Okapi) and Authentication Server (Keycloak) sessions
 *    to be destroyed
 * 2. it clears shared (localStorage) and private storage (sessionStorage,
 *    redux, react-query)
 *
 * The API call may or may not return 2xx. Whether a non-2xx response is treated
 * as an error depends on the state of storage when this function is invoked:
 *  _____________________________________
 * |                 | shared  | private |
 * |                 | storage | storage |
 * |-------------------------------------|
 * | 1 normal logout |    X    |   ?     |
 * |   primary tab   |         |         |
 * |-------------------------------------|
 * | 2 normal logout |         |   X     |
 * |   secondary tab |         |         |
 * |-------------------------------------|
 * | 3 no session    |         |         |
 *  -------------------------------------
 *
 * #1 describes the simplest "normal" circumstance: a user with a single tab
 * open clicks the "logout" button or an IST or FLST timer fires. In this
 * situation, the data in shared storage indicate a session is active; Stripes
 * expects a cookie to be present and therefore that the API request will
 * succeed. If the request fails, this indicates cookies were missing and that
 * FOLIO and Keycloak are out of sync; Stripes will redirect to Keycloak's
 * logout page to make sure its session is destroyed.
 *
 * #2 describes the situation when multiple tabs are open, "normal" logout has
 * proceeded in the primary tab, and Stripes arrives here with data in private
 * storage only. Given the primary tab destroyed the cookie, the API request is
 * guaranteed to fail, but because shared storage has also been removed, this is
 * expected and will not be treated as an error.
 *
 * #3 describes this situation when a user with no active session visits the
 * /logout route in the UI, e.g. by reloading the logout page. As in #2, because
 * shared storage has already been removed, the API request failure is expected
 * and this is not treated as an error.
 *
 * @param {Array} timers array of IST, FLST ResetTimers
 * @returns { mutation }
 */
export const useLogoutMutation = (timers) => {
  const queryClient = useQueryClient();
  const { store, okapi, config } = useStripes();

  // The tenant in x-okapi-header needs to match that provided in the AT for
  // the API call to succeed. Switching affiliations in an ECS environment
  // changes the tenant stored in stripes.okapi.tenant, so we look for the
  // tenant first in getLogoutTenant (where ECS envs store it on login) and
  // fallback to stripes.okapi.tenant.
  const tenant = getLogoutTenant()?.tenantId || okapi?.tenant;

  const ky = useOkapiKy({ tenant, rtrIgnore: true });

  return useMutation({
    mutationFn: async (reason = undefined) => {
      try {
        // Calling `/authn/logout` without an AT destroys the RT, making it
        // impossible to then rotate and replay the `/authn/logout` call. 🤦
        // Why doesn't it just return a 401 like every other endpoint? 🤷
        // To increase the likelihood that logout succeeds, we thus call
        // `/authn/refresh` with the hope that it will bless us with active
        // tokens, allowing us to logout successfully and destroy both the
        // keycloak and FOLIO sessions, keeping the world in sync.
        await ky.post('authn/refresh', { rtrIgnore: true });
        await ky.post('authn/logout', { rtrIgnore: true });
      } catch (err) {
        // if shared storage is present, treat API request failures as errors
        if (localStorage.getItem(SESSION_NAME)) {
          console.error('logout failure; session storage was active but the logout API request failed', err); // eslint-disable-line no-console
          const { clientId } = getLoginTenant(okapi, config);
          const logoutUrl = `${okapi.authnUrl}/realms/${tenant}/protocol/openid-connect/logout?post_logout_redirect_uri=http://localhost:3000/logout?reason=${reason}&client_id=${clientId}`;
          throw new SessionSyncError(logoutUrl);
        }
      } finally {
        await clearSharedStorage();
        clearPrivateStorage(store, queryClient, timers);
      }
    },
    retry: false,
  });
};
