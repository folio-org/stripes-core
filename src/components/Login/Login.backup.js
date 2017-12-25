import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import css from './Login.css';
import authFormStyles from './AuthForm.css';
import SSOLogin from '../SSOLogin';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  authError: PropTypes.string,
  handleSSOLogin: PropTypes.func,
  ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
};

function Login(props) {
  const {
    handleSubmit,
    pristine,
    submitting,
    authError,
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
              <Field id="input-username" component={TextField} name="username" type="text" placeholder="Username" />
            </div>
            <div className={css.minorSlab}>
              <Field id="input-password" component={TextField} name="password" type="password" placeholder="Password" />
            </div>
            <button id="clickable-login" type="submit" className={css.slabButton} onClick={handleSubmit} disabled={submitting || pristine}>
            Log in
            </button>
            { submitting ? <div><div className={loadingCN} /></div> : null }
            { authError ? <div className={css.loginError}>{authError}</div> : null }
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
