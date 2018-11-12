import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import Headline from '@folio/stripes-components/lib/Headline';

import OrganizationLogo from '../OrganizationLogo/OrganizationLogo';
import validateEmail from '../../validators/validateEmail/validateEmail';

import styles from './CheckEmailStatusPage.css';

const CheckEmailStatusPage = (props) => {
  const {
    location: {
      state: {
        userEmail,
      },
    },
  } = props;
  const isEmail = validateEmail(userEmail);
  const labelNamespace = 'stripes-core.label';
  const notificationText = isEmail
    ? `${labelNamespace}.sent.email`
    : `${labelNamespace}.your.email`;

  return (
    <Fragment>
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
          <Headline
            size="x-large"
            tag="p"
            bold={false}
            faded
            data-test-p-notification
          >
            <FormattedMessage
              id={notificationText}
              {...(isEmail && { values: { userEmail } })}
            />
          </Headline>
          <Headline
            size="x-large"
            tag="p"
            bold={false}
            faded
            data-test-p-caution
          >
            <FormattedMessage id={`${labelNamespace}.caution.email`} />
          </Headline>
        </div>
      </div>
    </Fragment>
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
