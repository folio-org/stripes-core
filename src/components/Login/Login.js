import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import css from './Login.css';
import SSOLogin from '../SSOLogin';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  authFail: PropTypes.bool,
  handleSSOLogin: PropTypes.func,
  ssoActive: PropTypes.any,
};

function Login(props) {
  const {
    handleSubmit,
    pristine,
    submitting,
    authFail,
    handleSSOLogin,
    ssoActive,
  } = props;

  const loadingCN = `${css.loading} ${css.blue}`;
  return (
    <div className={css.loginOverlay}>
      <div className={css.loginContainer}>
        <h1>Sign In</h1>
        <form>
          <div className={css.slabStack}>
            <div className={css.majorSlab}>
              <Field className={css.loginInput} name="username" type="text" component="input" placeholder="Username" />
            </div>
            <div className={css.minorSlab}>
              <Field className={css.loginInput} name="password" type="password" component="input" placeholder="Password" />
            </div>
            <button id="clickable-login" type="submit" className={css.slabButton} onClick={handleSubmit} disabled={submitting || pristine}>
            Log in
            </button>
            { submitting ? <div><div className={loadingCN} /></div> : null }
            { authFail ?
              <div>
                <span className={css.loginError} >
                  Sorry, the information entered does not match our records!
                </span>
              </div> : null }
          </div>
        </form>
        { ssoActive && <SSOLogin handleSSOLogin={handleSSOLogin} /> }
      </div>
    </div>
  );
}

Login.propTypes = propTypes;

export default reduxForm(
  {
    form: 'login',
  },
)(Login);
