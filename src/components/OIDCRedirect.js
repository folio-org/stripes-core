import { withRouter, Redirect, useLocation } from 'react-router';
import queryString from 'query-string';

/**
 * OIDCRedirect authenticated route handler for /oidc-landing.
 *
 * Reads `fwd` from URL params and redirects.
 *
 * @see RootWithIntl
 *
 * @returns {Redirect}
 */
const OIDCRedirect = () => {
  const location = useLocation();

  const getParams = () => {
    const search = location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  };

  const getUrl = () => {
    const params = getParams();
    return params?.fwd ?? '';
  };

  return (
    <Redirect to={getUrl()} />
  );
};

export default withRouter(OIDCRedirect);
