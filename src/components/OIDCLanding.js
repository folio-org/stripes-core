import React, { useEffect, useState } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import { useStore } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Loading } from '@folio/stripes-components';

import { requestUserWithPerms, setTokenExpiry } from '../loginServices';

import css from './Front.css';
import { useStripes } from '../StripesContext';

/**
 * OIDCLanding: un-authenticated route handler for /sso-landing.
 *
 * Reads one-time-code from URL params, exchanging it for an access_token
 * and then leveraging that to retrieve a user via requestUserWithPerms,
 * eventually dispatching session and Okapi-ready, resulting in a
 * re-render of RoothWithIntl with prop isAuthenticated: true.
 *
 * @see RootWithIntl
 */
const OIDCLanding = () => {
  const location = useLocation();
  const store = useStore();
  // const samlError = useRef();
  const { okapi } = useStripes();

  const [potp, setPotp] = useState();
  const [samlError, setSamlError] = useState();


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

    if (otp) {
      setPotp(otp);
      fetch(`${okapi.url}/authn/token?code=${otp}&redirect-uri=${window.location.protocol}//${window.location.host}/oidc-landing&fwd=${window.location.pathname}`, {
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
          setSamlError(e);
        });
    }
    // we only want to run this effect once, on load.
    // keycloak authentication will redirect here and the other deps will be constant:
    // location.search: the query string; this will never change
    // okapi.tenant, okapi.url: these are defined in stripes.config.js
    // store: the redux store
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (samlError) {
    return (
      <div data-test-saml-error>
        <div>
          <FormattedMessage id="errors.saml.missingToken" />
        </div>
        <div>
          <h3>code</h3>
          {potp}
          <h3>error</h3>
          <code>
            {JSON.stringify(samlError, null, 2)}
          </code>
        </div>
        <Redirect to="/" />
      </div>
    );
  }

  return (
    <div data-test-saml-success>
      <div className={css.frontWrap}>
        <Loading size="xlarge" />
      </div>
      <div>
        <pre>
          {JSON.stringify(samlError, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default OIDCLanding;
