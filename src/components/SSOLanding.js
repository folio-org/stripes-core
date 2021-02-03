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
    return cookies.ssoToken || params.ssoToken;
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
      requestUserWithPermsDeb(okapi.url, store, okapi.tenant, token);
    }
  });

  const params = getParams();
  const token = getToken();

  if (!token) {
    return (
      <div>
        No <code>ssoToken</code> cookie or query parameter
      </div>
    );
  }

  return (
    <div>
      <p>
        Logged in with token <tt>{token}</tt> from {params.ssoToken ? 'param' : 'cookie'}.
      </p>
    </div>
  );
};

export default SSOLanding;
