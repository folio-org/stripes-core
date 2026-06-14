import { useEffect } from 'react';
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
import { useLogoutMutation } from './useLogoutMutation';

import styles from './Logout.css';
import { SessionSyncError } from '../SessionSyncError';


export const parseError = (error) => {
  // do we have JSON from an error API response?
  if (error?.errors?.[0]?.message) {
    return error.errors[0].message;
  }

  // if not, do we have an Error object?
  if (typeof error?.message === 'string') {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return undefined;
};

/**
 * Logout
 * call useLogoutMutation() to terminate the session server-side, remove cookies,
 * and clear all browser storage and react storage such as redux, react-query,
 * and session timers.
 */
const Logout = ({ sessionTimeoutTimer, sessionTimeoutWarningTimer }) => {
  const { branding, okapi } = useStripes();
  const location = useLocation();
  const logoutMutation = useLogoutMutation([sessionTimeoutTimer, sessionTimeoutWarningTimer]);

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

  const error = parseError(location.state?.error);

  useEffect(() => {
    logoutMutation.mutate(params.get('reason'), {
      onError: (err) => {
        // logout failed. redirect to Keycloak's logout page
        if (err instanceof SessionSyncError) {
          globalThis.location.assign(err.resource);
        }
      }
    });

    // yes, ignore the logoutMutation dependency; just logout once, on-load.
    // Is there a way to do this without ignoring dependencies?
    // I haven't found it.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // show a loading spinner while logout is in process ...
  if (okapi.isAuthenticated) {
    return <LoadingView />;
  }

  // ... and show a "session terminated" message when the process is complete
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
          {error &&
            <Row center="xs">
              <Col xs={12}>
                <Headline>{error}</Headline>
              </Col>
            </Row>
          }
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
