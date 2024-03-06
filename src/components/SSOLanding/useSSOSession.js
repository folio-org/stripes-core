import { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import queryString from 'query-string';

import { config, okapi } from 'stripes-config';

import { defaultErrors } from '../../constants';
import { setAuthError } from '../../okapiActions';
import { requestUserWithPerms } from '../../loginServices';
import { parseJWT } from '../../helpers';

const getParams = (location) => {
  const search = location.search;

  if (!search) return undefined;

  return queryString.parse(search) || {};
};

const getToken = (cookies, params) => {
  return cookies?.ssoToken || params?.ssoToken;
};

const getTenant = (params, token) => {
  const tenant = config.useSecureTokens
    ? params?.tenant
    : parseJWT(token)?.tenant;

  return tenant || okapi.tenant;
};

const useSSOSession = () => {
  const [isFailed, setIsFailed] = useState(false);
  const store = useStore();
  const dispatch = useDispatch();

  const location = useLocation();
  const [cookies] = useCookies(['ssoToken']);

  const params = getParams(location);

  const token = getToken(cookies, params);
  const tenant = getTenant(params, token);

  useEffect(() => {
    requestUserWithPerms(okapi.url, store, tenant, token)
      .then(() => {
        if (store.getState()?.okapi?.authFailure) {
          return Promise.reject(new Error('SSO Failed'));
        }

        return Promise.resolve();
      })
      .catch(() => {
        dispatch(setAuthError([defaultErrors.SSO_SESSION_FAILED_ERROR]));
        setIsFailed(true);
      });
  /*
    Dependencies are not required here
    as all information is provided before component is rendered (query params or cookies)
    and session set up should be called only once
  */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isSessionFailed: isFailed,
  };
};

export default useSSOSession;
