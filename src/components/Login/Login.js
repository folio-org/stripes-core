import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { reduxForm, Field, Form, formValueSelector } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Headline from '@folio/stripes-components/lib/Headline';
import Button from '@folio/stripes-components/lib/Button';
import authFormStyles from './AuthForm.css';
import SSOLogin from '../SSOLogin';

class Login extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    authError: PropTypes.string,
    logoUrl: PropTypes.string,
    formValues: PropTypes.object,
    handleSSOLogin: PropTypes.func,
    ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
  }

  componentDidMount() {
    // Focus username input on mount
    document.getElementById('input-username').focus();
  }

  // Get organization logo
  getOrganizationLogo() {
    const { logoUrl } = this.props;

    if (!logoUrl) {
      return false;
    }

    return (
      <div className={authFormStyles.logo}>
        <img alt="" src={logoUrl} />
      </div>
    );
  }

  render() {
    const {
      handleSubmit,
      submitting,
      authError,
      handleSSOLogin,
      ssoActive,
      onSubmit,
      formValues,
    } = this.props;

    const { username, password } = formValues;
    const buttonDisabled = submitting || !(username && password);
    const buttonLabel = submitting ? 'Please wait..' : 'Log in';
    return (
      <div className={authFormStyles.wrap}>
        <div className={authFormStyles.centered}>
          {this.getOrganizationLogo()}
          <Form className={authFormStyles.form} onSubmit={handleSubmit(onSubmit)}>
            <Headline className={authFormStyles.formTitle} tag="h1">Log in</Headline>
            <div className={authFormStyles.formGroup}>
              <Field id="input-username" component={TextField} name="username" type="text" placeholder="Username" marginBottom0 fullWidth inputClass={authFormStyles.input} validationEnabled={false} hasClearIcon={false} />
            </div>
            <div className={authFormStyles.formGroup}>
              <Field id="input-password" component={TextField} name="password" type="password" placeholder="Password" marginBottom0 fullWidth inputClass={authFormStyles.input} validationEnabled={false} hasClearIcon={false} />
            </div>
            <div className={authFormStyles.formGroup}>
              <Button id="clickable-login" type="submit" buttonClass={authFormStyles.submitButton} disabled={buttonDisabled} fullWidth>
                {buttonLabel}
              </Button>
            </div>
            <div className={authFormStyles.formGroup}>
              { authError ? <div className={classNames(authFormStyles.formMessage, authFormStyles.error)}>{authError}</div> : null }
            </div>
            <div className={authFormStyles.formGroup}>
              { ssoActive && <SSOLogin handleSSOLogin={handleSSOLogin} /> }
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

const LoginForm = reduxForm({ form: 'login' })(Login);
const selector = formValueSelector('login');
export default connect(state => ({ formValues: selector(state, 'username', 'password') }))(LoginForm);
