import _ from 'lodash';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import queryString from 'query-string';
import { useStore } from 'react-redux';
import { config, okapi } from 'stripes-config';

import { parseJWT } from '../helpers';
import { requestUserWithPerms } from '../loginServices';

const requestUserWithPermsDeb = _.debounce(requestUserWithPerms, 5000, { leading: true, trailing: false });

const SSOLanding = () => {
  const location = useLocation();
  const [cookies] = useCookies(['ssoToken']);
  const store = useStore();

  const getParams = () => {
    const search = location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  };

  const getToken = () => {
    const params = getParams();
    return cookies?.ssoToken || params?.ssoToken;
  };

  const token = getToken();

  const getTenant = () => {
    const params = getParams();
    const tenant = config.useSecureTokens
      ? params?.tenant
      : parseJWT(token)?.tenant;

    return tenant || okapi.tenant;
  };

  const tenant = getTenant();

  useEffect(() => {
    if (tenant) {
      requestUserWithPermsDeb(okapi.url, store, tenant, token);
    }
  }, [tenant, token, store]);

  if (!tenant) {
    return (
      <div data-test-sso-error>
        No <code>tenant</code> in cookie or query parameter
      </div>
    );
  }

  return (
    <div data-test-sso-success>
      <p>
        Logged in with tenant <tt>{tenant}</tt>.
      </p>
    </div>
  );
};

export default SSOLanding;
