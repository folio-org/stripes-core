import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { includes } from 'lodash';

import Headline from '@folio/stripes-components/lib/Headline';

import { changePasswordErrorCodes } from '../../../../constants/changePasswordErrorCodes';
import OrganizationLogo from '../../../OrganizationLogo';

import styles from './ErrorPage.css';

const ErrorPage = ({ errors }) => {
  const labelNamespace = 'stripes-core.errors';
  const isExpiredLink = includes(errors, changePasswordErrorCodes.expiredErrorCode) || includes(errors, changePasswordErrorCodes.usedErrorCode);
  const errorCode = (isExpiredLink)
    ? changePasswordErrorCodes.expiredErrorCode
    : changePasswordErrorCodes.invalidErrorCode;

  return (
    <div className={styles.wrap}>
      <div className={styles.centered}>
        <OrganizationLogo />
        <Headline
          size="x-large"
          tag="p"
          bold={false}
          faded
        >
          <FormattedMessage id={`${labelNamespace}.${errorCode}`} />
        </Headline>
      </div>
    </div>
  );
};

ErrorPage.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ErrorPage;
