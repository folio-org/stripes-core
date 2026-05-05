import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Col,
  Headline,
  LoadingView,
  Row,
} from '@folio/stripes-components';

import OrganizationLogo from '../OrganizationLogo';
import { useStripes } from '../../StripesContext';
import {
  INIT,
  LOGOUT_TIMEOUT,
  getUnauthorizedPathFromSession,
  removeUnauthorizedPathFromSession,
} from '../../loginServices';

import styles from './Logout.css';
import { clearSessionStorage, useLogoutMutation } from './useLogoutMutation';

/**
 * Logout
 * Make an API call to /logout to terminate the session server-side and render
 * a "you've logged out" message. This component can be invoked from different
 * UI routes and will display a different message depending on that route:
 *
 * /logout: a user chose to end the session
 * /logout-timeout: stripes redirects to this location due to idle-session timeout
 *    the "reason" key in the query string provides additional details
 */
const Logout = ({ sessionTimeoutTimer, sessionTimeoutWarningTimer }) => {
  const { branding, okapi } = useStripes();
  const [didLogout, setDidLogout] = useState(false);
  const location = useLocation();
  const logoutMutation = useLogoutMutation(sessionTimeoutTimer, sessionTimeoutWarningTimer);

  let messageId = null;
  const messages = {
    [LOGOUT_TIMEOUT.ERROR]: 'stripes-core.rtr.error',
    [LOGOUT_TIMEOUT.EXPIRED]: 'stripes-core.rtr.expired',
    [LOGOUT_TIMEOUT.INACTIVITY]: 'stripes-core.rtr.idleSession.sessionExpiredSoSad',
    [INIT.ERROR]: 'stripes-core.init.error',
  };

  const params = new URLSearchParams(location.search);
  messageId = messages[params.get('reason')];

  if (!messageId && location.pathname === '/logout-timeout') {
    messageId = messages[LOGOUT_TIMEOUT.INACTIVITY];
  }

  if (!messageId) {
    messageId = 'stripes-core.logoutComplete';
  }

  useEffect(() => {
    if (okapi.isAuthenticated) {
      logoutMutation.mutateAsync(clearSessionStorage)
        .then(() => setDidLogout(true));
    } else {
      setDidLogout(true);
    }

    // yes, ignore the logoutMutation dependency; just logout once, on-load.
    // WHAT IS THE CORRECT WAY TO DO THIS???
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (_e) => {
    removeUnauthorizedPathFromSession();
  };

  const redirectTo = getUnauthorizedPathFromSession() || '/';

  if (!didLogout) {
    return <LoadingView />;
  }

  return (
    <main>
      <div className={styles.wrapper} style={branding.style?.login ?? {}}>
        <div className={styles.container}>
          <Row center="xs">
            <Col xs={12}>
              <OrganizationLogo />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={12}>
              <Headline size="large"><FormattedMessage id={messageId} /></Headline>
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={12}>
              <Button to={redirectTo} onClick={handleClick}><FormattedMessage id="stripes-core.rtr.idleSession.logInAgain" /></Button>
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

Logout.propTypes = {
  sessionTimeoutTimer: PropTypes.shape({
    clear: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
  }),
  sessionTimeoutWarningTimer: PropTypes.shape({
    clear: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
  }),
};

export default Logout;
