import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { reduxForm, Field, Form, formValueSelector } from 'redux-form';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import { branding } from 'stripes-config';
import authFormStyles from './AuthForm.css';
import SSOLogin from '../SSOLogin';

class Login extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }),
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    authError: PropTypes.string,
    formValues: PropTypes.object,
    handleSSOLogin: PropTypes.func,
    ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    submitSucceeded: PropTypes.bool,
  }

  componentDidMount() {
    // Focus username input on mount
    document.getElementById('input-username').focus();
  }

  render() {
    // Get organization logo
    const getOrganizationLogo = () => {
      if (!branding) {
        return false;
      }

      return (
        <div className={authFormStyles.logo}>
          <img alt={branding.logo.alt} src={branding.logo.src} />
        </div>
      );
    };

    const {
      handleSubmit,
      submitting,
      authError,
      handleSSOLogin,
      ssoActive,
      onSubmit,
      formValues,
      submitSucceeded,
      stripes: { intl: { formatMessage: translate } },
    } = this.props;

    const { username } = formValues;
    const buttonDisabled = submitting || submitSucceeded || !(username);
    const buttonLabel = translate({ id: (submitting || (submitSucceeded)) ? 'stripes-core.loggingIn' : 'stripes-core.login' });
    return (
      <div className={authFormStyles.wrap}>
        <div className={authFormStyles.centered}>
          {getOrganizationLogo()}
          <Form className={authFormStyles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={authFormStyles.formGroup}>
              <Field
                id="input-username"
                component={TextField}
                name="username"
                type="text"
                placeholder={translate({ id: 'stripes-core.username' })}
                marginBottom0
                fullWidth
                inputClass={authFormStyles.input}
                validationEnabled={false}
                hasClearIcon={false}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
            <div className={authFormStyles.formGroup}>
              <Field
                id="input-password"
                component={TextField}
                name="password"
                type="password"
                placeholder={translate({ id: 'stripes-core.password' })}
                marginBottom0
                fullWidth
                inputClass={authFormStyles.input}
                validationEnabled={false}
                hasClearIcon={false}
                autoComplete="current-password"
              />
            </div>
            <div className={authFormStyles.formGroup}>
              <Button buttonStyle="primary" id="clickable-login" type="submit" buttonClass={authFormStyles.submitButton} disabled={buttonDisabled} fullWidth marginBottom0>
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
