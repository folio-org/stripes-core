import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Redirect from '../Redirect';
import PreLoginLanding from '../PreLoginLanding';
import Login from '../Login';

import { setOkapiTenant } from '../../okapiActions';
import { setUnauthorizedPathToSession } from '../../loginServices';

const AuthnLogin = ({ stripes }) => {
  const { config, okapi } = stripes;
  const { tenantOptions = {} } = config;

  useEffect(() => {
    if (okapi.authnUrl) {
    /** Store unauthorized pathname to session storage. Refs STCOR-789
    * @see OIDCRedirect
    */
      setUnauthorizedPathToSession(window.location.pathname);
    }
    // we only want to run this effect once, on load.
    // okapi.authnUrl are defined in stripes.config.js
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (okapi.authnUrl) {
    if (config.isSingleTenant) {
      const defaultTenant = Object.entries(tenantOptions)[0];
      const redirectUri = `${window.location.protocol}//${window.location.host}/oidc-landing`;
      const authnUri = `${okapi.authnUrl}/realms/${defaultTenant.name}/protocol/openid-connect/auth?client_id=${defaultTenant.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
      return <Redirect to={authnUri} />;
    }

    const handleSelectTenant = (tenant, clientId) => {
      localStorage.setItem('tenant', JSON.stringify({ tenantName: tenant, clientId }));
      stripes.store.dispatch(setOkapiTenant({ tenant, clientId }));
    };

    return <PreLoginLanding onSelectTenant={handleSelectTenant} />;
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
