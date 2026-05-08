import { withRouter, Redirect, useLocation } from 'react-router';
import queryString from 'query-string';
import { useStripes } from '../StripesContext';
import {
  AUTOMATIC_LOGOUT_LOCATION,
  getUnauthorizedPathFromSession,
  removeUnauthorizedPathFromSession
} from '../loginServices';

// Setting at top of component since value should be retained during re-renders
// but will be correctly re-fetched when redirected from Keycloak login page.
// The empty try/catch is necessary because, by setting this at the top of
// the component, it is automatically executed even before <App /> renders.
// IOW, even though we check for session-storage in App, we still have to
// protect the call here.
let unauthorizedPath = null;
try {
  unauthorizedPath = getUnauthorizedPathFromSession();
} catch (e) { // eslint-disable-line no-empty
}

/**
 * OIDCRedirect authenticated route handler for /oidc-landing.
 * Call getUnauthorizedPathFromSession() to retrieve a value saved on logout
 * if the logout was due to an idle-session-timeout. This allows users to pick
 * up exactly where they were working.
 *
 * Note the special sentinel value AUTOMATIC_LOGOUT_LOCATION, which is used
 * to redirect to /logout instead. See /src/components/Logout/useLogoutMutation
 * for details. If the Stripes and Keycloak sessions get out of sync where
 * the Stripes session has been destroyed but the Keycloak session is still
 * active, they can be synced -- and both destroyed -- by redirecting to
 * Keycloak, which will immediately return to Stripes, allowing both sessions
 * to be destroyed.
 *
 * Read unauthorized_path from session storage if keycloak authn provided
 * if `fwd` provided into redirect url, it causes strange behavior - infinite login requests
 * decided to use session storage for that case. Refs STCOR-789
 *
 * Reads `fwd` from URL params and redirects.
 *
 * @see RootWithIntl
 * @see AuthnLogin
 *
 * @returns {Redirect}
 */
const OIDCRedirect = () => {
  const location = useLocation();
  const stripes = useStripes();

  const getParams = () => {
    const search = location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  };

  const getUrl = () => {
    if (stripes.okapi.authnUrl) {
      if (unauthorizedPath) {
        removeUnauthorizedPathFromSession();

        if (unauthorizedPath === AUTOMATIC_LOGOUT_LOCATION) {
          return 'logout';
        }
        return unauthorizedPath;
      }
    }

    const params = getParams();
    return params?.fwd ?? '';
  };

  return (
    <Redirect to={getUrl()} />
  );
};

export default withRouter(OIDCRedirect);
