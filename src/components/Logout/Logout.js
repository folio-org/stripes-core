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
  LOGOUT_MESSAGES,
  getUnauthorizedPathFromSession,
  removeUnauthorizedPathFromSession,
} from '../../loginServices';
import { useLogoutQuery } from './useLogoutQuery';

import styles from './Logout.css';

/**
 * Logout
 * call useLogoutQuery() to terminate the session server-side, remove cookies,
 * and clear all browser storage and react storage such as redux, react-query,
 * and session timers.
 */
const Logout = ({ sessionTimeoutTimer, sessionTimeoutWarningTimer }) => {
  const { branding, okapi } = useStripes();
  const location = useLocation();

  // abuse useQuery to run once on-load, which AFAICT is impossible to do
  // with useMutation in useEffect with a properly defined dependency array.
  // that is, useMutation returns a function that it expects you to call in an
  // event handler, rather than automatically on-load. so, here we are, calling
  // a query and ignoring its response.
  useLogoutQuery([sessionTimeoutTimer, sessionTimeoutWarningTimer]);

  let messageId = null;
  const messages = {
    [LOGOUT_MESSAGES.ERROR]: 'stripes-core.rtr.error',
    [LOGOUT_MESSAGES.EXPIRED]: 'stripes-core.rtr.expired',
    [LOGOUT_MESSAGES.INACTIVITY]: 'stripes-core.rtr.idleSession.sessionExpiredSoSad',
    [LOGOUT_MESSAGES.INIT_ERROR]: 'stripes-core.init.error',
  };

  // pluck `reason` from the query string and use it to provide additional
  // information about why this logout occurred
  const params = new URLSearchParams(location.search);
  messageId = messages[params.get('reason')];
  if (!messageId) {
    messageId = 'stripes-core.logoutComplete';
  }

  const handleClick = (_e) => {
    removeUnauthorizedPathFromSession();
  };

  const redirectTo = getUnauthorizedPathFromSession() || '/';

  if (okapi.isAuthenticated) {
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
