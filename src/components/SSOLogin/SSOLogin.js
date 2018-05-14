import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@folio/stripes-components/lib/Button';
import authFormStyles from '../Login/AuthForm.css';

const propTypes = {
  handleSSOLogin: PropTypes.func.isRequired,
};

function SSOLogin(props) {
  const {
    handleSSOLogin,
  } = props;

  return (
    <div className={authFormStyles.formGroup}>
      <Button buttonStyle="primary" type="button" buttonClass={authFormStyles.submitButton} onClick={handleSSOLogin} fullWidth>
        <FormattedMessage id="stripes-core.loginViaSSO" />
      </Button>
      <form id="ssoForm" />
    </div>
  );
}

SSOLogin.propTypes = propTypes;

export default SSOLogin;
