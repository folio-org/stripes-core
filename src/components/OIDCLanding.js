import { debounce } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { useLocation, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import { useStore } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Loading } from '@folio/stripes-components';

import { requestUserWithPerms } from '../loginServices';

import css from './Front.css';
import { useStripes } from '../StripesContext';

const requestUserWithPermsDeb = debounce(requestUserWithPerms, 5000, { leading: true, trailing: false });

/**
 * OIDCLanding: un-authenticated route handler for /sso-landing.
 *
 * Reads one-time-code from URL params, exchanging it for an access_token
 * and then leveraging that to retrieve a user via requestUserWithPerms,
 * eventually dispatching session and Okapi-ready, resulting in a
 * re-render with a token present, i.e., authenticated.
 *
 * @see RootWithIntl
 */
const OIDCLanding = () => {
  const location = useLocation();
  const store = useStore();
  const samlError = useRef();
  const { okapi } = useStripes();

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

  /**
   * Exchange the otp for an access token, then use it to retrieve
   * the user
   *
   * See https://ebscoinddev.atlassian.net/wiki/spaces/TEUR/pages/12419306/mod-login-keycloak#mod-login-keycloak-APIs
   * for additional details. May not be necessary for SAML-specific pages
   * to exist since the workflow is the same for SSO. We can just inspect
   * the response for SSO-y values or SAML-y values and act accordingly.
   */
  useEffect(() => {
    if (otp) {
      fetch(`${okapi.url}/authn/token?code=${otp}&redirect-uri=${window.location.protocol}//${window.location.host}/oidc-landing`, {
        headers: { 'X-Okapi-tenant': okapi.tenant, 'Content-Type': 'application/json' },
        credentials: 'include',
        mode: 'cors',
      })
        .then((resp) => {
          if (resp.ok) {
            return resp.json().then((json) => {
              return requestUserWithPermsDeb(okapi.url, store, okapi.tenant, json.okapiToken);
            });
          } else {
            return resp.json().then((error) => {
              throw error;
            });
          }
        })
        .catch(e => {
          console.error('@@ Oh, snap, OTP exchange failed!', e);
          samlError.current = e;
        });
    }
  }, [otp, store]);

  if (!otp) {
    return (
      <div data-test-saml-error>
        <div>
          <FormattedMessage id="errors.saml.missingToken" />
        </div>
        <div>
          <code>
            {JSON.stringify(samlError.current, null, 2)}
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
          {JSON.stringify(samlError.current, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default OIDCLanding;
