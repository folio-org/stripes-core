import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { Headline } from '@folio/stripes-components';

import OrganizationLogo from '../OrganizationLogo/OrganizationLogo';
import validateEmail from '../../validators/validateEmail/validateEmail';
import { hideEmail } from '../../helpers';

import styles from './CheckEmailStatusPage.css';

const NOTIFICATION_DELAY_MS = 500;

const CheckEmailStatusPage = (props) => {
  const {
    location: {
      state: {
        userEmail,
      },
    },
  } = props;

  // A live region is only announced when its content changes after the region has been
  // registered by assistive technology. Render the container empty first and fill it
  // after a short delay; filling it in the same frame as the mount is not announced.
  // Both messages are inserted as a single subtree so they are announced once, together.
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotification(true), NOTIFICATION_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const isEmail = validateEmail(userEmail);
  const labelNamespace = 'stripes-core.label';
  const notificationText = isEmail
    ? `${labelNamespace}.sent.email`
    : `${labelNamespace}.your.email`;
  const userEmailMessage = isEmail
    ? { hiddenUserEmail: hideEmail(userEmail) }
    : {};

  return (
    <div
      className={styles.wrap}
      data-test-status-page
    >
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="xx-large"
          tag="h1"
          data-test-h1
        >
          <FormattedMessage id={`${labelNamespace}.check.email`} />
        </Headline>
        <div
          aria-live="polite"
          data-test-live-region
        >
          {showNotification && (
            <>
              <Headline
                size="x-large"
                tag="p"
                weight="regular"
                faded
                data-test-p-notification
              >
                <FormattedMessage
                  id={notificationText}
                  values={userEmailMessage}
                />
              </Headline>
              <Headline
                size="x-large"
                tag="p"
                weight="regular"
                faded
                data-test-p-caution
              >
                <FormattedMessage id={`${labelNamespace}.caution.email`} />
              </Headline>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CheckEmailStatusPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      userEmail: PropTypes.string.isRequired
    }).isRequired,
  }).isRequired,
};

export default withRouter(CheckEmailStatusPage);
