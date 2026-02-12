import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { useQueryClient } from 'react-query';
import { branding } from 'stripes-config';

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
 *
 */
const Logout = () => {
  const stripes = useStripes();
  const [didLogout, setDidLogout] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  const messageId = location.pathName === '/logout-timeout' ? 'stripes-core.rtr.idleSession.sessionExpiredSoSad' : 'stripes-core.logoutComplete';

  useEffect(
    () => {
      if (stripes.okapi.isAuthenticated) {
        stripes.sessionTimeoutTimer.cancel();
        stripes.sessionTimeoutWarningTimer.cancel();

        // returns a promise, which we ignore
        logout(stripes.okapi.url, stripes.store, queryClient)
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
