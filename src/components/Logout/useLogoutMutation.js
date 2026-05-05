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
  getLogoutTenant,
  SESSION_NAME,
  TENANT_LOCAL_STORAGE_KEY,
} from '../../loginServices';
import {
  RTR_TIMEOUT_EVENT
} from '../Root/constants';
import useOkapiKy from '../../useOkapiKy';

/**
 * logout
 * logout is a multi-part process, but this function is idempotent.
 * 1.  there are server-side things to do, i.e. fetch /authn/logout.
 *     these must only be done once, no matter how many tabs are open
 *     because once the fetch completes the cookies are gone, which
 *     means a repeat request will fail.
 * 2.  there is shared storage to clean out, i.e. storage that is shared
 *     across tabs such as localStorage and localforage. clearing storage
 *     that another tab has already cleared is fine, if pointless.
 * 3.  there is private storage to clean out, i.e. storage that is unique
 *     to the current tab/window. this storage _must_ be cleared in each
 *     instance of stripes (i.e. in each separate tab/window) because the
 *     instances running in other tabs do not have access to it.
 * What does all this mean? It means some things we need to check on and
 * maybe do (the server-side things), some we can do (the shared storage)
 * and some we must do (the private storage).
 *
 * @param {object} redux store
 * @param {object} queryClient react-query client, if available; used to clear react-query cache on logout
 * @param {array} timers
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

    timers.forEach(timer => timer.clear());

    // clear private-storage
    store.dispatch(setIsAuthenticated(false));
    store.dispatch(clearCurrentUser());
    store.dispatch(clearOkapiToken());
    store.dispatch(resetStore());

    // clear react-query cache
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

export const useLogoutMutation = (sessionTimeoutTimer, sessionTimeoutWarningTimer) => {
  const queryClient = useQueryClient();
  const { store } = useStripes();

  // Since the tenant in the x-okapi-token and the x-okapi-tenant header
  // on logout should match, switching affiliations updates
  // store.okapi.tenant, leading to mismatched tenant names from the token.
  // Use the tenant name stored during login to ensure they match.
  const ky = useOkapiKy({ tenant: getLogoutTenant()?.tenantId || store.getState()?.okapi?.tenant });

  return useMutation({
    mutationFn: async (logoutFn) => {
      // check the shared-storage sentinel: if logout has already started
      // in another window, we don't want to invoke shared functions again
      // (like calling /authn/logout, which can only be called once because it
      // destroys cookies, and therefore is guaranteed to return 4xx if called more
      // than once, BUT we DO want to clear private storage such as session storage
      // and redux, which are not shared across tabs/windows.
      if (localStorage.getItem(SESSION_NAME)) {
        await ky.post('authn/logout');
      }
      return logoutFn;
    },
    // call logout regardless of whether the /authn/logout call succeeds
    // Swallow all errors related to this fetch in order to make sure logout
    // continues and storage is cleared. If both cookies have been deleted,
    // RTR will intervene on the first failure ... and then itself fail if
    // the RT is missing. If that happens, so be it. We will continue to
    // clear out storage.
    onSettled: (logoutFn) => logoutFn(store, queryClient, [sessionTimeoutTimer, sessionTimeoutWarningTimer]),
  });
};
