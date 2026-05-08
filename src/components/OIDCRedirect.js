import { useRef } from 'react';
import { withRouter, Redirect } from 'react-router';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

import { useStripes } from '../StripesContext';
import {
  AUTOMATIC_LOGOUT_LOCATION,
  getUnauthorizedPathFromSession,
  removeUnauthorizedPathFromSession
} from '../loginServices';

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
 * @see useLogoutMutation
 *
 * @returns {Redirect}
 */
const OIDCRedirect = () => {
  const location = useLocation();
  const stripes = useStripes();
  const unauthorizedPathRef = useRef();

  if (!unauthorizedPathRef.current) {
    unauthorizedPathRef.current = getUnauthorizedPathFromSession();
  }

  const getParams = () => {
    const search = location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  };

  const getUrl = () => {
    if (stripes.okapi.authnUrl) {
      if (unauthorizedPathRef.current) {
        removeUnauthorizedPathFromSession();

        if (unauthorizedPathRef.current === AUTOMATIC_LOGOUT_LOCATION) {
          return 'logout';
        }
        return unauthorizedPathRef.current;
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
