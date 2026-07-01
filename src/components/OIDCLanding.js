import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router';

import {
  Headline,
  Loading,
} from '@folio/stripes-components';

import {
  consumeUnauthorizedTenantFromSession,
  LOGOUT_MESSAGES,
  requestUserWithPerms,
  storeLogoutTenant,
} from '../loginServices';
import { useStripes } from '../StripesContext';

import css from './Front.css';

import useExchangeCode from './useExchangeCode';

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
const OIDCLanding = ({ handleRotation }) => {
  const intl = useIntl();
  const { okapi, store } = useStripes();
  const history = useHistory();

  /**
   * initSession
   * Callback for useExchangeCode to execute after exchanging the OTP
   * for token-expiration data and cookies
   * @param {object} tokenData shaped like { accessTokenExpiration, refreshTokenExpiration}
   */
  const initSession = (tokenData) => {
    if (tokenData) {
      handleRotation(tokenData)
        .then(() => {
          return storeLogoutTenant(okapi.tenant);
        })
        .then(() => {
          const options = {
            preservedSessionTenant: consumeUnauthorizedTenantFromSession(),
          };

          return requestUserWithPerms(okapi, store, okapi.tenant, '', options);
        });
    }
  };

  const { tokenData, isLoading, error } = useExchangeCode(initSession);

  // an error during token-exchange amounts to an init error: the user's
  // keycloak session is active but their FOLIO session is not. redirect to
  // /logout.
  if (error) {
    history.push(`/logout?reason=${LOGOUT_MESSAGES.INIT_ERROR}`);
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

OIDCLanding.propTypes = {
  handleRotation: PropTypes.func.isRequired,
};
export default OIDCLanding;
