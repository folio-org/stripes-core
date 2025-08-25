import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useStore } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Col,
  Headline,
  Loading,
  Row,
} from '@folio/stripes-components';

import OrganizationLogo from './OrganizationLogo';
import {
  getOIDCRedirectUri,
  requestUserWithPerms,
  setTokenExpiry,
  storeLogoutTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

import css from './Front.css';

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
  const location = useLocation();
  const store = useStore();
  const { okapi } = useStripes();
  const [oidcError, setOIDCError] = useState();

  /**
   * Exchange the otp for AT/RT cookies, then retrieve the user.
   *
   * See https://ebscoinddev.atlassian.net/wiki/spaces/TEUR/pages/12419306/mod-login-keycloak#mod-login-keycloak-APIs
   * for additional details. May not be necessary for SAML-specific pages
   * to exist since the workflow is the same for SSO. We can just inspect
   * the response for SSO-y values or SAML-y values and act accordingly.
   */
  useEffect(() => {
    const getParams = () => {
      const search = location.search;
      if (!search) return undefined;
      return queryString.parse(search) || {};
    };

    /**
     * retrieve the OTP
     * @returns {string}
     */
    const getOtp = () => {
      return getParams()?.code;
    };

    const otp = getOtp();

    const redirectUri = getOIDCRedirectUri(okapi.tenant, okapi.clientId);

    if (otp) {
      fetch(`${okapi.url}/authn/token?code=${otp}&redirect-uri=${redirectUri}`, {
        credentials: 'include',
        headers: { 'X-Okapi-tenant': okapi.tenant, 'Content-Type': 'application/json' },
        mode: 'cors',
      })
        .then((resp) => {
          if (resp.ok) {
            return resp.json()
              .then((json) => {
                return setTokenExpiry({
                  atExpires: json.accessTokenExpiration ? new Date(json.accessTokenExpiration) : Date.now() + (60 * 1000),
                  rtExpires: json.refreshTokenExpiration ? new Date(json.refreshTokenExpiration) : Date.now() + (2 * 60 * 1000),
                });
              })
              .then(() => {
                return requestUserWithPerms(okapi.url, store, okapi.tenant);
              })
              .then(() => {
                // for login itself we're storing selected tenant and clientId in the url
                // but we still need to store tenantId in localStorage for logout purposes
                // `logout` function in loginServices.js provides details about this.
                storeLogoutTenant(okapi.tenant);
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
          setOIDCError(e);
        });
    }
    // we only want to run this effect once, on load.
    // keycloak authentication will redirect here and the other deps will be constant:
    // location.search: the query string; this will never change
    // okapi.tenant, okapi.url: these are defined in stripes.config.js
    // store: the redux store
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * formatOIDCError
   * Return formatted OIDC error message, or null
   * @returns
   */
  const formatOIDCError = () => {
    if (Array.isArray(oidcError?.errors)) {
      return (
        <Row center="xs">
          <Col xs={12}>
            <Headline>{oidcError.errors[0]?.message}</Headline>
          </Col>
        </Row>
      );
    }

    return null;
  };

  if (oidcError) {
    return (
      <main data-test-saml-error>
        <Row center="xs">
          <Col xs={12}>
            <OrganizationLogo />
          </Col>
        </Row>
        <Row center="xs">
          <Col xs={12}>
            <Headline size="large"><FormattedMessage id="stripes-core.errors.oidc" /></Headline>
          </Col>
        </Row>
        {formatOIDCError()}
        <Row center="xs">
          <Col xs={12}>
            <Button to="/"><FormattedMessage id="stripes-core.rtr.idleSession.logInAgain" /></Button>
          </Col>
        </Row>
      </main>
    );
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
