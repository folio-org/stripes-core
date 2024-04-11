import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Redirect from '../Redirect';
import PreLoginLanding from '../PreLoginLanding';
import Login from '../Login';

import { setOkapiTenant } from '../../okapiActions';
import { setUnauthorizedPathToSession } from '../../loginServices';

const AuthnLogin = ({ stripes }) => {
  const { config, okapi } = stripes;

  useEffect(() => {
    if (config.isEureka) {
    /** Store unauthorized pathname to session storage. Refs STCOR-789
    * @see OIDCRedirect
    */
      setUnauthorizedPathToSession(window.location.pathname);
    }
    // we only want to run this effect once, on load.
    // config.authnUrl are defined in stripes.config.js
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (config.isEureka) {
    const isSingleTenant = Object.keys(config.tenantOptions).length === 1;
    if (isSingleTenant) {
      const redirectUri = `${window.location.protocol}//${window.location.host}/oidc-landing`;
      const authnUri = `${config.authnUrl}/realms/${okapi.tenant}/protocol/openid-connect/auth?client_id=${okapi.clientId}&response_type=code&redirect_uri=${redirectUri}&scope=openid`;
      return <Redirect to={authnUri} />;
    }

    const handleSelectTenant = (tenant, clientId, url) => {
      localStorage.setItem('tenant', JSON.stringify({ tenantName: tenant, clientId, url }));
      stripes.store.dispatch(setOkapiTenant({ tenant, clientId, url }));
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
