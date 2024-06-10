import React, { useEffect } from 'react';
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

  useEffect(() => {
    if (okapi.authnUrl) {
    /** Store unauthorized pathname to session storage. Refs STCOR-789
    * @see OIDCRedirect
    */
      setUnauthorizedPathToSession(window.location.pathname);
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
      const redirectUri = `${window.location.protocol}//${window.location.host}/oidc-landing`;
      const authnUri = `${okapi.authnUrl}/realms/${okapi.tenant}/protocol/openid-connect/auth?client_id=${okapi.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
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
