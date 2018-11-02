import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@folio/stripes-components/lib/Button';
import styles from '../CreateResetPassword/CreateResetPassword.css';

const propTypes = {
  handleSSOLogin: PropTypes.func.isRequired,
};

function SSOLogin(props) {
  const {
    handleSSOLogin,
  } = props;

  return (
    <div className={styles.formGroup}>
      <Button buttonStyle="primary" type="button" buttonClass={styles.submitButton} onClick={handleSSOLogin} fullWidth>
        <FormattedMessage id="stripes-core.loginViaSSO" />
      </Button>
      <form id="ssoForm" />
    </div>
  );
}

SSOLogin.propTypes = propTypes;

export default SSOLogin;
