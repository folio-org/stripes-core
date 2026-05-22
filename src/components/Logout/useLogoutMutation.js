import { useMutation, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
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
  AUTOMATIC_LOGOUT_LOCATION,
  getLogoutTenant,
  SESSION_NAME,
  setUnauthorizedPathToSession,
  TENANT_LOCAL_STORAGE_KEY,
} from '../../loginServices';
import {
  RTR_TIMEOUT_EVENT
} from '../Root/constants';
import useOkapiKy from '../../useOkapiKy';

/**
 * clearSession
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
export async function clearSession(store, queryClient, timers) {
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
 * useLogoutMutation
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
 * If cookies are missing**, the API call will fail, preventing the Keycloak
 * session from being terminated. This puts Stripes and Keycloak out of sync,
 * no bueno.
 *
 * In order to actually terminate the Keycloak session, we clear
 * browser storage, push a special "return-to" value in session storage, and
 * then redirect to root, prompting Stripes to redirect to Keycloak (since
 * other session data has already been cleared), which will then immediately
 * redirect back to Stripes (remember, the Keycloak session is still active).
 * Finding the special value in the "return-to" session key, Stripes will
 * redirect to `/logout`, beginning the logout process for a second time, but
 * this time with the sessions in sync (both active) allowing both to be
 * terminated.
 *
 * ** It's easy to end up in this situation. For example, sign in, do some
 *    work, and then close the tab without clicking the 'logout' button. At
 *    this point, the session will be persisted to local-storage and the
 *    browser will cache cookies until they expire. Once the cookies expire,
 *    however, the session will continue to perist; since no tabs are open,
 *    there is no Stripe process running its timers to clean up the session,
 *    storage, and cookies, when they expire.
 *
 * @param {Array} timers array of IST, FLST ResetTimers
 * @returns { mutation }
 */
export const useLogoutMutation = (timers) => {
  const queryClient = useQueryClient();
  const { store, okapi } = useStripes();
  const history = useHistory();

  // The tenant in x-okapi-header needs to match that provided in the AT for
  // the API call to succeed. Switching affiliations in an ECS environment
  // changes the tenant stored in stripes.okapi.tenant, so we look for the
  // tenant first in getLogoutTenant (where ECS envs store it on login) and
  // fallback to stripes.okapi.tenant.
  const ky = useOkapiKy({ tenant: getLogoutTenant()?.tenantId || okapi?.tenant });

  return useMutation({
    mutationFn: async () => {
      // check the shared-storage sentinel: if logout has already started
      // in another window, there is no value in running this query again
      // because the second time (now that cookies were destroyed) it is
      // guaranteed to return 4xx. if we run it accidentally, trap any errors
      // to make sure we can still proceed with clearing storage.
      let didFailLogout = false;
      if (localStorage.getItem(SESSION_NAME)) {
        try {
          // Calling `/authn/logout` without an AT destroys the RT, making it
          // impossible to then rotate and replay the `/authn/logout` call. 🤦
          // Why doesn't it just return a 401 like every other endpoint? 🤷
          // To increase the likelihood that logout succeeds, we thus call
          // `/authn/refresh` with the hope that it will bless us with active
          // tokens, allowing us to logout successfully and destroy both the
          // keycloak and FOLIO sessions, keeping the world in sync.
          // if either request fails, set the did-fail sentinel in order to
          // kick off the sync-and-destroy workflow.
          await ky.post('authn/refresh');
          await ky.post('authn/logout');
        } catch (err) {
          console.error('uhoh, logout request failed!', err); // eslint-disable-line no-console
          didFailLogout = true;
        }
      }

      // sessionStorage, redux-storage, react-query, etc are NOT shared across
      // tabs/windows, so the clear-storage call always executes
      await clearSession(store, queryClient, timers);

      // if the /authn/logout API call fails, store a special "return to"
      // sentinel and then redirect to root in order to kick off the
      // stripes->keycloak->stripes->logout process.
      if (didFailLogout) {
        setUnauthorizedPathToSession(AUTOMATIC_LOGOUT_LOCATION);
        history.push('/');
      }
    },
    retry: false,
  });
};
