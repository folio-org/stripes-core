import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import {
  reduxForm,
  Field,
  Form,
  formValueSelector,
} from 'redux-form';

import isEmpty from 'lodash/isEmpty';

import {
  TextField,
  Button,
  Row,
  Col,
  Headline,
} from '@folio/stripes-components';

import SSOLogin from '../SSOLogin';
import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';
import FieldLabel from '../CreateResetPassword/components/FieldLabel';

import styles from './Login.css';

class Login extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    authErrors: PropTypes.arrayOf(PropTypes.object),
    formValues: PropTypes.object,
    handleSSOLogin: PropTypes.func.isRequired,
    ssoActive: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    submitSucceeded: PropTypes.bool,
  };

  static defaultProps = {
    submitting: false,
    authErrors: [],
    formValues: {},
    ssoActive: false,
    submitSucceeded: false,
  };

  constructor(props) {
    super(props);

    this.translateNamespace = 'stripes-core';
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
    const submissionStatus = submitting || submitSucceeded;
    const buttonDisabled = submissionStatus || !(username);
    const buttonLabel = submissionStatus ? 'loggingIn' : 'login';

    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Row center="xs">
            <Col xs={6}>
              <OrganizationLogo />
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={6}>
              <Headline
                size="xx-large"
                tag="h1"
                data-test-h1
              >
                <FormattedMessage id={`${this.translateNamespace}.title.login`} />
              </Headline>
            </Col>
          </Row>
          <Row>
            <Form
              className={styles.form}
              onSubmit={handleSubmit(onSubmit)}
            >
              <div data-test-new-username-field>
                <Row center="xs">
                  <Col xs={6}>
                    <Row
                      between="xs"
                      bottom="xs"
                    >
                      <Col xs={3}>
                        <FieldLabel htmlFor="password">
                          <FormattedMessage id={`${this.translateNamespace}.username`} />
                        </FieldLabel>
                      </Col>
                      <Col data-test-new-forgot-username-link>
                        <Button
                          href="/forgot-username"
                          buttonClass={styles.link}
                          type="button"
                          buttonStyle="link"
                          allowAnchorClick
                        >
                          <FormattedMessage id={`${this.translateNamespace}.button.forgotUsername`} />
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row center="xs">
                  <Col xs={6}>
                    <Field
                      id="input-username"
                      name="username"
                      type="text"
                      component={TextField}
                      inputClass={styles.input}
                      autoComplete="username"
                      autoCapitalize="none"
                      validationEnabled={false}
                      hasClearIcon={false}
                      marginBottom0
                      fullWidth
                      autoFocus
                    />
                  </Col>
                </Row>
              </div>
              <div data-test-new-username-field>
                <Row center="xs">
                  <Col xs={6}>
                    <Row
                      between="xs"
                      bottom="xs"
                    >
                      <Col xs={3}>
                        <FieldLabel htmlFor="password">
                          <FormattedMessage id={`${this.translateNamespace}.password`} />
                        </FieldLabel>
                      </Col>
                      <Col data-test-new-forgot-password-link>
                        <Button
                          href="/forgot-password"
                          buttonClass={styles.link}
                          type="button"
                          buttonStyle="link"
                          allowAnchorClick
                        >
                          <FormattedMessage id={`${this.translateNamespace}.button.forgotPassword`} />
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row center="xs">
                  <Col xs={6}>
                    <Field
                      id="input-password"
                      component={TextField}
                      name="password"
                      type="password"
                      marginBottom0
                      fullWidth
                      inputClass={styles.input}
                      validationEnabled={false}
                      hasClearIcon={false}
                      autoComplete="password"
                    />
                  </Col>
                </Row>
              </div>
              <Row center="xs">
                <Col xs={6}>
                  <div className={styles.formGroup}>
                    <Button
                      buttonStyle="primary"
                      id="clickable-login"
                      type="submit"
                      buttonClass={styles.submitButton}
                      disabled={buttonDisabled}
                      fullWidth
                      marginBottom0
                    >
                      <FormattedMessage id={`${this.translateNamespace}.${buttonLabel}`} />
                    </Button>
                  </div>
                </Col>
              </Row>
              <Row center="xs">
                <Col xs={6}>
                  <div className={styles.authErrorsWrapper}>
                    { !isEmpty(authErrors) && <AuthErrorsContainer errors={authErrors} /> }
                  </div>
                  <div className={styles.formGroup}>
                    { ssoActive && <SSOLogin handleSSOLogin={handleSSOLogin} /> }
                  </div>
                </Col>
              </Row>
            </Form>
          </Row>
        </div>
      </div>
    );
  }
}

const LoginForm = reduxForm({
  form: 'login',
})(Login);
const selector = formValueSelector('login');

export default connect(state => ({
  formValues: selector(
    state,
    'username',
    'password',
  )
}))(LoginForm);
