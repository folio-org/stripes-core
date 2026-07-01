import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Redirect from '../Redirect';
import PreLoginLanding from '../PreLoginLanding';
import Login from '../Login';

import { setOkapiTenant } from '../../okapiActions';
import {
  setUnauthorizedPathToSession,
  getOIDCRedirectUri,
  setUnauthorizedTenantToSession,
  getUnauthorizedPathFromSession,
} from '../../loginServices';

const AuthnLogin = ({ handleRotation, stripes }) => {
  const { config, okapi } = stripes;
  // If config.tenantOptions is not defined, default to classic okapi.tenant and okapi.clientId
  const { tenantOptions = [{ name: okapi.tenant, clientId: okapi.clientId }] } = config;
  const tenants = Object.values(tenantOptions);

  const setTenant = (tenant, clientId) => {
    stripes.store.dispatch(setOkapiTenant({ tenant, clientId }));

    /**
     * When a user selects a tenant from the dropdown, we want to cache that tenant in session storage
     * so that if they are redirected to the login page due to an inactivity timeout, we can pre-select that tenant for them.
     * We also want to cache it if they are redirected due to an RTR error, since that can occur even if the user is active.
     *
     * It should be set together with URL path caching in setUnauthorizedPathToSession, since both are needed to restore the user's session after a timeout or error.
    */
    if (okapi.authnUrl && !getUnauthorizedPathFromSession()) {
      // Only set the tenant in session if there isn't already an unauthorized path stored, to avoid overwriting the tenant for a user who is being redirected due to a timeout or error.
      setUnauthorizedTenantToSession(tenant);
    }
  };

  useLayoutEffect(() => {
    /**
     * Cache the current path so we can return to it after authenticating.
     * In RootWithIntl, unauthenticated visits to protected paths will be
     * handled by this component, i.e.
     *   /some-interesting-path <AuthnLogin>
     * but if the user was de-authenticated due to a session timeout, they
     * will have a history something like
     *   /some-interesting-path <SomeInterestingComponent>
     *   /logout <Logout>
     *   / <AuthnLogin>
     * but we still want to return to /some-interesting-path, which will
     * have been cached by the logout-timeout handler, and must not be
     * overwritten here.
     *
     * @see OIDCRedirect
     */
    if (okapi.authnUrl && window.location.pathname !== '/') {
      setUnauthorizedPathToSession();
    }

    // If only 1 tenant is defined in config (in either okapi or config.tenantOptions) set to okapi to be accessed there
    // in the rest of the application for compatibity across existing modules.
    if (tenants.length === 1) {
      const loginTenant = tenants[0];
      setTenant(loginTenant.name, loginTenant.clientId);
    }
    // we only want to run this effect once, on load.
    // okapi.authnUrl tenant values are defined in stripes.config.js
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (okapi.authnUrl) {
    // If only 1 tenant is defined in config, skip the tenant selection screen.
    if (tenants.length === 1) {
      const loginTenant = tenants[0];
      const redirectUri = getOIDCRedirectUri(loginTenant.name, loginTenant.clientId);
      const authnUri = `${okapi.authnUrl}/realms/${loginTenant.name}/protocol/openid-connect/auth?client_id=${loginTenant.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
      return <Redirect to={authnUri} />;
    }

    return <PreLoginLanding onSelectTenant={setTenant} />;
  }

  return <Login
    autoLogin={config.autoLogin}
    handleRotation={handleRotation}
    stripes={stripes}
  />;
};

AuthnLogin.propTypes = {
  handleRotation: PropTypes.func.isRequired,
  stripes: PropTypes.object
};

export default AuthnLogin;
