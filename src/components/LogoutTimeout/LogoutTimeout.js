import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
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
import { logout } from '../../loginServices';

import styles from './LogoutTimeout.css';
import {
  getUnauthorizedPathFromSession,
  removeUnauthorizedPathFromSession,
} from '../../loginServices';

/**
 * LogoutTimeout
 * Show a "sorry, your session timed out message"; if the session is still
 * active, call logout() to end it.
 *
 * Having a static route to this page allows the logout handler to choose
 * between redirecting straight to the login page (if the user chose to
 * logout) or to this page (if the session timed out).
 *
 * This corresponds to the '/logout-timeout' route.
 */
const LogoutTimeout = () => {
  const stripes = useStripes();
  const [didLogout, setDidLogout] = useState(false);

  useEffect(
    () => {
      if (stripes.okapi.isAuthenticated) {
        // returns a promise, which we ignore
        logout(stripes.okapi.url, stripes.store)
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

  if (!didLogout) {
    return <LoadingView />;
  }

  const handleClick = (_e) => {
    removeUnauthorizedPathFromSession();
  };

  const previousPath = getUnauthorizedPathFromSession();
  const redirectTo = previousPath ?? '/';

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
              <Headline size="large"><FormattedMessage id="stripes-core.rtr.idleSession.sessionExpiredSoSad" /></Headline>
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

export default LogoutTimeout;
