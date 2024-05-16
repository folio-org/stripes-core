import { FormattedMessage } from 'react-intl';
import { branding } from 'stripes-config';
import { Redirect } from 'react-router';

import {
  Button,
  Col,
  Headline,
  Row,
} from '@folio/stripes-components';

import OrganizationLogo from '../OrganizationLogo';
import { useStripes } from '../../StripesContext';

import styles from './LogoutTimeout.css';

/**
 * LogoutTimeout
 * For unauthenticated users, show a "sorry, your session timed out" message
 * with a link to login page. For authenticated users, redirect to / since
 * showing such a message would be a misleading lie.
 *
 * Having a static route to this page allows the logout handler to choose
 * between redirecting straight to the login page (if the user chose to
 * logout) or to this page (if the session timeout out).
 *
 * This corresponds to the '/logout-timeout' route.
 */
const LogoutTimeout = () => {
  const stripes = useStripes();

  if (stripes.okapi.isAuthenticated) {
    return <Redirect to="/" />;
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
              <Headline size="large"><FormattedMessage id="rtr.idleSession.sessionExpiredSoSad" /></Headline>
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={12}>
              <Button to="/"><FormattedMessage id="rtr.idleSession.logInAgain" /></Button>
            </Col>
          </Row>
        </div>
      </div>
    </main>
  );
};

export default LogoutTimeout;
