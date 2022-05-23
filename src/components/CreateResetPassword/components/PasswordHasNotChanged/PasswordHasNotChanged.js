import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { includes } from 'lodash';

import { Headline } from '@folio/stripes-components';

import {
  changePasswordErrorCodes,
  defaultErrorCodes,
} from '../../../../constants';
import OrganizationLogo from '../../../OrganizationLogo';

import styles from './PasswordHasNotChanged.css';

class PasswordHasNotChanged extends Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    errors: [],
  };

  defineErrorCode = () => {
    const { errors } = this.props;
    const labelNamespace = 'stripes-core.errors';

    const errorCodes = errors.map((e) => e?.code);

    const isExpiredLink = includes(errorCodes, changePasswordErrorCodes.EXPIRED_ERROR_CODE);
    const isUsedLink = includes(errorCodes, changePasswordErrorCodes.USED_ERROR_CODE);
    const isOutdatedLink = isExpiredLink || isUsedLink;
    const isInvalidLink = includes(errorCodes, changePasswordErrorCodes.INVALID_ERROR_CODE) && !isOutdatedLink;

    if (isInvalidLink) {
      return `${labelNamespace}.${changePasswordErrorCodes.INVALID_ERROR_CODE}`;
    }

    if (isOutdatedLink) {
      return `${labelNamespace}.${changePasswordErrorCodes.EXPIRED_ERROR_CODE}`;
    }

    return `${labelNamespace}.${defaultErrorCodes.DEFAULT_SERVER_ERROR}`;
  };

  render() {
    const errorCode = this.defineErrorCode();

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
            faded
            data-test-message
          >
            <FormattedMessage id={errorCode} />
          </Headline>
        </div>
      </div>
    );
  }
}

export default PasswordHasNotChanged;
