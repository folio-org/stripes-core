import React, { useLayoutEffect, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Redirect from '../Redirect';
import PreLoginLanding from '../PreLoginLanding';
import Login from '../Login';

import { setOkapiTenant } from '../../okapiActions';
import {
  setUnauthorizedPathToSession,
  getOIDCRedirectUri,
} from '../../loginServices';
import entitlementService from '../../entitlementService';

const AuthnLogin = ({ stripes }) => {
  const { config, okapi } = stripes;
  const [tenantOptions, setTenantOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant options asynchronously
  useEffect(() => {
    const loadTenantOptions = async () => {
      try {
        const options = await entitlementService.getTenantOptions();
        // If no entitlement options, fallback to config.tenantOptions, then okapi.tenant
        if (Object.keys(options).length > 0) {
          setTenantOptions(options);
        } else if (config.tenantOptions && Object.keys(config.tenantOptions).length > 0) {
          setTenantOptions(config.tenantOptions);
        } else if (okapi.tenant) {
          // Classic single tenant fallback
          setTenantOptions({ [okapi.tenant]: { name: okapi.tenant, clientId: okapi.clientId } });
        } else {
          setTenantOptions({});
        }
      } catch (error) {
        console.error('Failed to load tenant options:', error);
        // Fallback to config.tenantOptions if entitlementService fails
        if (config.tenantOptions && Object.keys(config.tenantOptions).length > 0) {
          setTenantOptions(config.tenantOptions);
        } else if (okapi.tenant) {
          setTenantOptions({ [okapi.tenant]: { name: okapi.tenant, clientId: okapi.clientId } });
        } else {
          setTenantOptions({});
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantOptions();
  }, [okapi.tenant, okapi.clientId, config.tenantOptions]);

  const tenants = tenantOptions ? Object.values(tenantOptions) : [];

  const setTenant = (tenant, clientId) => {
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
      setUnauthorizedPathToSession();
    }

    // If only 1 tenant is defined, set to okapi to be accessed there
    // in the rest of the application for compatibity across existing modules.
    // This effect will run again when tenantOptions loads
    if (!isLoading && tenants.length === 1) {
      const loginTenant = tenants[0];
      setTenant(loginTenant.name, loginTenant.clientId);
    }
    // we only want to run this effect when tenants change or loading completes
    // okapi.authnUrl tenant values are defined in stripes.config.js
  }, [tenants, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading state while tenant options are being fetched
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

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
    stripes={stripes}
  />;
};

AuthnLogin.propTypes = {
  stripes: PropTypes.object
};

export default AuthnLogin;
