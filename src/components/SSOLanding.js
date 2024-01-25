import _ from 'lodash';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import queryString from 'query-string';
import { useStore } from 'react-redux';
import { okapi } from 'stripes-config';

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

  useEffect(() => {
    if (token) {
      setTimeout(() => requestUserWithPermsDeb(okapi.url, store, okapi.tenant, token), 1000);
    }
  }, [token, store]);

  console.log('rendering ssolanding');
  if (!token) {
    return (
      <div data-test-sso-error id="sso-screen">
        No <code>ssoToken</code> cookie or query parameter
      </div>
    );
  }

  return (
    <div data-test-sso-success id="sso-screen">
      <p>
        Logged in with token <tt>{token}</tt> from {getParams()?.ssoToken ? 'param' : 'cookie'}.
      </p>
    </div>
  );
};

export default SSOLanding;
