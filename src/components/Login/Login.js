import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field, Form, formValueSelector } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import isEmpty from 'lodash/isEmpty';
import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import authFormStyles from './AuthForm.css';
import SSOLogin from '../SSOLogin';
import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';

class Login extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    authErrors: PropTypes.arrayOf(PropTypes.object),
    formValues: PropTypes.object,
    handleSSOLogin: PropTypes.func,
    ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    submitSucceeded: PropTypes.bool,
  };

  static defaultProps = {
    authErrors: []
  };

  componentDidMount() {
    // Focus username input on mount
    document.getElementById('input-username').focus();
  }

  render() {
    const {
      handleSubmit,
      submitting,
      authErrors,
      handleSSOLogin,
      ssoActive,
      onSubmit,
      formValues,
      submitSucceeded,
    } = this.props;

    const { username } = formValues;
    const buttonDisabled = submitting || submitSucceeded || !(username);
    const buttonLabel = (submitting || (submitSucceeded)) ? (
      <FormattedMessage id="stripes-core.loggingIn" />
    ) : (
      <FormattedMessage id="stripes-core.login" />
    );

    return (
      <div className={authFormStyles.wrap}>
        <div className={authFormStyles.centered}>
          <OrganizationLogo />
          <Form className={authFormStyles.form} onSubmit={handleSubmit(onSubmit)}>
            <div className={authFormStyles.formGroup}>
              <FormattedMessage id="stripes-core.username">
                {placeholder => (
                  <Field
                    id="input-username"
                    component={TextField}
                    name="username"
                    type="text"
                    placeholder={placeholder}
                    marginBottom0
                    fullWidth
                    inputClass={authFormStyles.input}
                    validationEnabled={false}
                    hasClearIcon={false}
                    autoComplete="username"
                    autoCapitalize="none"
                  />
                )}
              </FormattedMessage>
            </div>
            <div className={authFormStyles.formGroup}>
              <FormattedMessage id="stripes-core.password">
                {placeholder => (
                  <Field
                    id="input-password"
                    component={TextField}
                    name="password"
                    type="password"
                    placeholder={placeholder}
                    marginBottom0
                    fullWidth
                    inputClass={authFormStyles.input}
                    validationEnabled={false}
                    hasClearIcon={false}
                    autoComplete="current-password"
                  />
                )}
              </FormattedMessage>
            </div>
            <div className={authFormStyles.formGroup}>
              <Button buttonStyle="primary" id="clickable-login" type="submit" buttonClass={authFormStyles.submitButton} disabled={buttonDisabled} fullWidth marginBottom0>
                {buttonLabel}
              </Button>
            </div>
            <div className={authFormStyles.formGroup}>
              { !isEmpty(authErrors) && <AuthErrorsContainer errors={authErrors} /> }
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
