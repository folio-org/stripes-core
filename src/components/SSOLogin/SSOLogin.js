import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';

import { Button } from '@folio/stripes-components';
import styles from '../CreateResetPassword/CreateResetPassword.css';

const propTypes = {
  handleSSOLogin: PropTypes.func.isRequired,
};

function SSOLogin(props) {
  const { handleSSOLogin } = props;

  return (
    <div className={styles.formGroup}>
      <Button
        data-test-sso-login-button
        buttonStyle="primary"
        type="button"
        buttonClass={styles.submitButton}
        fullWidth
        onClick={handleSSOLogin}
      >
        <FormattedMessage id="stripes-core.loginViaSSO" />
      </Button>
    </div>
  );
}

SSOLogin.propTypes = propTypes;

export default SSOLogin;
