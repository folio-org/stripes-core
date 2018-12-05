import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { includes } from 'lodash';

import Headline from '@folio/stripes-components/lib/Headline';

import { changePasswordErrorCodes } from '../../../../constants/changePasswordErrorCodes';
import OrganizationLogo from '../../../OrganizationLogo';

import styles from './ChangePasswordError.css';

const ChangePasswordError = ({ errors }) => {
  const labelNamespace = 'stripes-core.errors';
  const isExpiredLink = includes(errors, changePasswordErrorCodes.EXPIRED_ERROR_CODE) || includes(errors, changePasswordErrorCodes.USED_ERROR_CODE);
  const errorCode = (isExpiredLink)
    ? changePasswordErrorCodes.EXPIRED_ERROR_CODE
    : changePasswordErrorCodes.INVALID_ERROR_CODE;

  return (
    <div
      className={styles.wrap}
      data-test-change-password-error
    >
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="x-large"
          tag="p"
          bold={false}
          faded
          data-test-message
        >
          <FormattedMessage id={`${labelNamespace}.${errorCode}`} />
        </Headline>
      </div>
    </div>
  );
};

ChangePasswordError.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ChangePasswordError;
