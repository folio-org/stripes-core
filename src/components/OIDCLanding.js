import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import {
  Headline,
  Loading,
} from '@folio/stripes-components';

import {
  requestUserWithPerms,
  setTokenExpiry,
  storeLogoutTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

import css from './Front.css';

import useExchangeCode from './useExchangeCode';
import OIDCLandingError from './OIDCLandingError';

/**
 * OIDCLanding: un-authenticated route handler for /oidc-landing.
 *
 * * Read one-time-code from URL params
 * * make an API call to /authn/token to exchange the OTP for cookies
 * * call requestUserWithPerms to make an API call to .../_self,
 *   eventually dispatching session and Okapi-ready, resulting in a
 *   re-render of RoothWithIntl with prop isAuthenticated: true
 *
 * @see RootWithIntl
 */
const OIDCLanding = () => {
  const intl = useIntl();
  const { okapi, store } = useStripes();
  const [userFetchError, setUserFetchError] = useState();

  const { data: tokenData, isLoading, error: tokenError } = useExchangeCode();

  const atDefaultExpiration = Date.now() + (60 * 1000);
  const rtDefaultExpiration = Date.now() + (2 * 60 * 1000);

  useEffect(() => {
    if (tokenData) {
      setTokenExpiry({
        atExpires: tokenData.accessTokenExpiration ? new Date(tokenData.accessTokenExpiration).getTime() : atDefaultExpiration,
        rtExpires: tokenData.refreshTokenExpiration ? new Date(tokenData.refreshTokenExpiration).getTime() : rtDefaultExpiration,
      })
        .then(() => {
          return storeLogoutTenant(okapi.tenant);
        })
        .then(() => {
          return requestUserWithPerms(okapi.url, store, okapi.tenant);
        })
        .catch(e => {
          setUserFetchError(e);
        });
    }
  }, [tokenData]); // eslint-disable-line react-hooks/exhaustive-deps

  // token exchange failure
  if (tokenError) {
    return <OIDCLandingError error={tokenError} />;
  }

  // session-init failure
  if (userFetchError) {
    return <OIDCLandingError error={userFetchError} />;
  }

  return (
    <div data-test-saml-success>
      <div className={css.frontWrap}>
        <div>
          <Loading size="xlarge" />
        </div>
        <Headline size="xx-large">
          {isLoading && intl.formatMessage({ id: 'stripes-core.oidc.validatingAuthenticationToken' })}
          {tokenData && intl.formatMessage({ id: 'stripes-core.oidc.initializingSession' })}
        </Headline>
      </div>
    </div>
  );
};

export default OIDCLanding;
