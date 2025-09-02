import React, { useEffect, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { okapi as okapiConfig, config } from 'stripes-config';

import {
  Loading,
} from '@folio/stripes-components';

import {
  getLoginTenant,
  getOIDCRedirectUri,
  getTokenExpiry,
  requestUserWithPerms,
  setTokenExpiry,
  storeLogoutTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';
import OIDCLandingError from './OIDCLandingError';
import css from './Front.css';

//
// This page defines exhcangeOtp(), and then calls it outside the lifecycle of
// the component defined here, OIDCLanding. The request that exchanges the OTP
// from Keycloak for AT/RT cookies must only run once, which is _exactly_ the
// kind of "only once" application initialization described in the React docs:
// https://react.dev/learn/synchronizing-with-effects#not-an-effect-initializing-the-application
//
// But ... there is also a component here, and it uses a ref to avoid an effect
// running multiple times, which is explictly called out as an anti-pattern
// in that same document. What gives?!? Once we know OTP exchange was
// successful, then we need to initialize the session, including populating
// the redux, which means application init can't happen completely outside the
// component lifecycle where the store isn't available.
//
// Additionally, effects run twice in development in order to simulate when a
// component mounts, unmounts, and remounts, but that will never happen here
// because the ONLY legit time for this component to mount is when Keycloak
// redirects to this route. That is the only time this component mounts, and
// then _by design_ it never mounts again.
//
// Fin

const OTP_EXCHANGE_SUCCESS = '@folio/stripes/core::OTPExchangeSuccess';
let otpError = null;

export const exchangeOtp = (setToken, setTenant) => {
  otpError = null;
  const urlParams = new URLSearchParams(window.location.search);
  const otp = urlParams.get('code');
  const { tenant, clientId } = getLoginTenant(okapiConfig, config);

  const redirectUri = getOIDCRedirectUri(tenant, clientId);

  if (otp) {
    fetch(`${okapiConfig.url}/authn/token?code=${otp}&redirect-uri=${redirectUri}`, {
      credentials: 'include',
      headers: { 'X-Okapi-tenant': tenant, 'Content-Type': 'application/json' },
      mode: 'cors',
    })
      .then((resp) => {
        if (resp.ok) {
          return resp.json()
            .then((json) => {
              return setToken({
                // if AT/RT values are missing in the response from _self,
                // store near-future expiration values instead of the (missing)
                // actual values. given that we arrived here, we know the request
                // was successful, i.e. cookies are present, even though their
                // values are (oddly) missing in the response body.
                atExpires: json.accessTokenExpiration ? new Date(json.accessTokenExpiration).getTime() : Date.now() + (60 * 1000),
                rtExpires: json.refreshTokenExpiration ? new Date(json.refreshTokenExpiration).getTime() : Date.now() + (2 * 60 * 1000),
              });
            })
            .then(() => {
              // for login itself we're storing selected tenant and clientId in the url
              // but we still need to store tenantId in localStorage for logout purposes
              // `logout` function in loginServices.js provides details about this.
              setTenant(tenant);

              // emit OPT_EXCHANGE_SUCCESS just in case the component mounted
              // before OTP exchange completed. otherwise, the component would
              // not know about the status of OTP exchange, and would never
              // begin session-init.
              window.dispatchEvent(new Event(OTP_EXCHANGE_SUCCESS));
            });
        } else {
          return resp.json().then((error) => {
            throw error;
          });
        }
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.error('@@ Oh, snap, OTP exchange failed!', e);
        // copy the error into the global otpError
        otpError = e;
      });
  }
};

exchangeOtp(setTokenExpiry, storeLogoutTenant);

/**
 * OIDCLanding: un-authenticated route handler for /oidc-landing.
 *
 * After OTP exchange completes successfully, make an API request to .../_self.
 * The handlers that parse the response from this request will eventually
 * dispatch session-ready and okapi-ready events, causing RootWithIntl to
 * re-render with the prop isAuthenticated set to true, and providing an
 * alternative component to handle this route. That handler, OIDCRedirect,
 * does what you expect, redirecting the user to the root URL for their
 * session.
 *
 * @see RootWithIntl
 */
const OIDCLanding = () => {
  const store = useStore();
  const { okapi } = useStripes();
  const [userFetchError, setUserFetchError] = useState();

  // React docs SPECIFICALLY warn against using refs to prevent effects from
  // firing 2x in development, yet here is this ref. WTF?!?
  //
  // We have this ref because session init needs to happen EXACTLY once, and
  // there is no legit path to this component, except on the redirect-from-
  // login. IOW, there is not legit reason for this component to be remounted;
  // once OTP exchange and session-init kick off, it is impossible to return
  // here.
  const isInitializingRef = useRef(false);

  const handleOTPExchangeSuccess = () => {
    if (!isInitializingRef.current && !okapi.isAuthenticated) {
      isInitializingRef.current = true;
      getTokenExpiry().then(res => {
        if (res?.atExpires && res.atExpires > Date.now()) {
          requestUserWithPerms(okapiConfig.url, store, okapi.tenant)
            .catch(e => {
              setUserFetchError(e);
            });
        }
      });
    }
  };

  // the OTP exchange process will emit an OTP_EXCHANGE_SUCCESS event ...
  window.addEventListener(OTP_EXCHANGE_SUCCESS, handleOTPExchangeSuccess);

  // ... but if the event emits before the application is initialized and
  // this component loads, of course we still want to react to the fact that
  // OTP exchange completed successfully, so this effect does the same thing.
  //
  // exhaustive-dep checking is off because this component must never remount
  // since OTP exchange is a one-time thing.
  useEffect(() => {
    handleOTPExchangeSuccess();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  // failure during OTP-exchange request
  if (otpError) {
    return <OIDCLandingError error={otpError} />;
  }

  // failure during session-init
  if (userFetchError) {
    return <OIDCLandingError error={userFetchError} />;
  }

  return (
    <div data-test-saml-success>
      <div className={css.frontWrap}>
        <Loading size="xlarge" />
      </div>
    </div>
  );
};

export default OIDCLanding;
