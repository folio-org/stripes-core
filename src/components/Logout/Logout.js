import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useQueryClient } from 'react-query';

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
  LOGOUT_TIMEOUT,
  getUnauthorizedPathFromSession,
  logout,
  removeUnauthorizedPathFromSession,
} from '../../loginServices';

import styles from './Logout.css';

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
const Logout = () => {
  const { branding, okapi, sessionTimeoutTimer, sessionTimeoutWarningTimer, store } = useStripes();
  const [didLogout, setDidLogout] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  let messageId = null;
  if (location.pathname === '/logout-timeout') {
    const messages = {
      [LOGOUT_TIMEOUT.ERROR]: 'stripes-core.rtr.error',
      [LOGOUT_TIMEOUT.EXPIRED]: 'stripes-core.rtr.expired',
      [LOGOUT_TIMEOUT.INACTIVITY]: 'stripes-core.rtr.idleSession.sessionExpiredSoSad',
    };

    const params = new URLSearchParams(location.search);
    messageId = messages[params.get('reason')] || messages[LOGOUT_TIMEOUT.INACTIVITY];
  }


  if (!messageId) {
    messageId = 'stripes-core.logoutComplete';
  }


  useEffect(
    () => {
      if (okapi.isAuthenticated) {
        sessionTimeoutTimer.cancel();
        sessionTimeoutWarningTimer.cancel();

        // returns a promise, which we ignore
        logout(okapi.url, store, queryClient)
          .then(setDidLogout(true));
      } else {
        setDidLogout(true);
      }
    },
    // no dependencies because we only want to start the logout process once.
    // we don't care about changes to stripes; certainly it'll be updated as
    // part of the logout process
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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

export default Logout;
