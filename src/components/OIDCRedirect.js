import { withRouter, Redirect, useLocation } from 'react-router';
import queryString from 'query-string';
import { useStripes } from '../StripesContext';
import { getUnauthorizedPathFromSession, removeUnauthorizedPathFromSession } from '../loginServices';

// Setting at top of component since value should be retained during re-renders
// but will be correctly re-fetched when redirected from Keycloak login page.
const unauthorizedPath = getUnauthorizedPathFromSession();

/**
 * OIDCRedirect authenticated route handler for /oidc-landing.
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
