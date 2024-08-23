import React, { useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Redirect from '../Redirect';
import PreLoginLanding from '../PreLoginLanding';
import Login from '../Login';

import { setOkapiTenant } from '../../okapiActions';
import { setUnauthorizedPathToSession } from '../../loginServices';

const AuthnLogin = ({ stripes }) => {
  const { config, okapi } = stripes;
  // If config.tenantOptions is not defined, default to classic okapi.tenant and okapi.clientId
  const { tenantOptions = [{ name: okapi.tenant, clientId: okapi.clientId }] } = config;
  const tenants = Object.values(tenantOptions);

  const setTenant = (tenant, clientId) => {
    localStorage.setItem('tenant', JSON.stringify({ tenantName: tenant, clientId }));
    stripes.store.dispatch(setOkapiTenant({ tenant, clientId }));
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
      setUnauthorizedPathToSession(window.location.pathname + window.location.search);
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
      const redirectUri = `${window.location.protocol}//${window.location.host}/oidc-landing`;
      const authnUri = `${okapi.authnUrl}/realms/${loginTenant.name}/protocol/openid-connect/auth?client_id=${loginTenant.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
      return <Redirect to={authnUri} />;
    }

    return <PreLoginLanding onSelectTenant={setTenant} />;
  }

  return <Login
    autoLogin={config.autoLogin}
    stripes={stripes}
  />;
};

AuthnLogin.propTypes = {
  stripes: PropTypes.object
};

export default AuthnLogin;
