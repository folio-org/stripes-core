import React, { PropTypes } from 'react';
import css from '../Login/Login.css';

const propTypes = {
  handleSSOLogin: PropTypes.func.isRequired,
};

function SSOLogin(props) {
  const {
    handleSSOLogin,
  } = props;

  return (
    <div className={css.slabStack}>
      <button type="button" className={css.slabButton} onClick={handleSSOLogin}>Login via SSO</button>
      <form id="ssoForm">
      </form>
    </div>
  );
}

SSOLogin.propTypes = propTypes;

export default (SSOLogin);
