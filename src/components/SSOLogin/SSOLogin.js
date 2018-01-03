import React from 'react';
import PropTypes from 'prop-types';
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
      <Button type="button" buttonClass={authFormStyles.submitButton} onClick={handleSSOLogin} fullWidth>Login via SSO</Button>
      <form id="ssoForm" />
    </div>
  );
}

SSOLogin.propTypes = propTypes;

export default SSOLogin;
