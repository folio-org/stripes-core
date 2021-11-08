import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from 'react-intl';
import {
  FormSpy,
  Field,
  Form,
} from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

import {
  TextField,
  Button,
  Row,
  Col,
  PasswordStrength,
  Headline,
  Layout,
} from '@folio/stripes-components';


import { setAuthError } from '../../okapiActions';
import { stripesShape } from '../../Stripes';

import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';
import FieldLabel from './components/FieldLabel';

import styles from './CreateResetPassword.css';

class CreateResetPassword extends Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    onSubmit: PropTypes.func.isRequired,
    clearAuthErrors: PropTypes.func.isRequired,
    onPasswordInputFocus: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    submitIsFailed: PropTypes.bool,
    form: PropTypes.shape({
      getState: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    submitting: false,
    submitIsFailed: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      passwordMasked: true,
      formIsPristine: true,
    };
    this.translationNamespaces = {
      module: 'stripes-core',
      smartComponents: 'stripes-smart-components',
      page: 'stripes-core.createResetPassword',
      errors: 'stripes-core.errors',
      button: 'stripes-core.button',
    };
    this.passwordErrorCodes = {
      match: 'password.match.error',
      length: 'password.length.error',
      numeric: 'password.numeric.error',
      special: 'password.special.error',
      lowerAndUpperCase: 'password.lowerAndUpperCase.error',
    };
    this.passwordRules = [{
      regex: /^.{8,}$/,
      errorCode: this.passwordErrorCodes.length,
    }, {
      regex: /\d/,
      errorCode: this.passwordErrorCodes.numeric,
    }, {
      regex: /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/,
      errorCode: this.passwordErrorCodes.special,
    }, {
      regex: /(?=.*[a-z])(?=.*[A-Z])/,
      errorCode: this.passwordErrorCodes.lowerAndUpperCase,
    }];
    this.inputColProps = {
      xs:12,
      sm:8,
    };
    this.passwordMeterColProps = {
      xs:12,
      sm:4,
      className:styles.passwordStrength,
    };
  }

  togglePasswordMask = () => {
    this.setState(({ passwordMasked }) => ({
      passwordMasked: !passwordMasked,
    }));
  };

  validationHandler = ({ newPassword, confirmPassword }) => {
    const { clearAuthErrors } = this.props;

    if (this.state.formIsPristine) {
      return null;
    }

    const errorCode = this.passwordRules.find(rule => !rule.regex.test(newPassword))?.errorCode;
    const confirmPasswordValid = !(newPassword && confirmPassword && newPassword !== confirmPassword);

    if (errorCode) {
      this.dispatchValidationError(
        [errorCode],
        this.translationNamespaces.errors,
      );

      return FORM_ERROR;
    }

    if (!confirmPasswordValid) {
      this.dispatchValidationError(
        [this.passwordErrorCodes.match],
        this.translationNamespaces.errors,
      );

      return FORM_ERROR;
    }

    clearAuthErrors();
    return null;
  };

  onFormStateChange = (state) => {
    this.setState({
      formIsPristine: state.pristine,
    });
  };

  dispatchValidationError = (errors, translationNamespace) => {
    const {
      stripes: {
        store: {
          dispatch,
        },
      },
    } = this.props;

    dispatch(setAuthError(errors.map((error) => {
      return {
        code: error,
        translationNamespace,
      };
    })));
  };

  render() {
    const {
      submitting,
      onSubmit,
      onPasswordInputFocus,
      submitIsFailed,
      stripes
    } = this.props;

    const errors = stripes.okapi.authFailure;
    const { passwordMasked } = this.state;
    const submissionStatus = submitting || submitIsFailed;
    const passwordType = passwordMasked ? 'password' : 'text';
    const buttonLabelId = `${this.translationNamespaces.module}.${submitting ? 'settingPassword' : 'setPassword'}`;
    const passwordToggleLabelId = `${this.translationNamespaces.button}.${passwordMasked ? 'show' : 'hide'}Password`;

    const isButtonDisabled = getState => {
      const { newPassword, confirmPassword } = getState().values;
      return !isEmpty(errors) || submissionStatus || !(newPassword && confirmPassword);
    };

    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Row center="xs">
            <Col
              xs={12}
              sm={6}
            >
              <OrganizationLogo />
            </Col>
          </Row>
          <Row center="xs">
            <Col
              xs={12}
              sm={6}
            >
              <Headline
                margin="none"
                size="xx-large"
                tag="h1"
                data-test-h1
              >
                <FormattedMessage id={`${this.translationNamespaces.page}.header`} />
              </Headline>
            </Col>
          </Row>
          <Row>
            <Form
              onSubmit={onSubmit}
              subscription={{
                initialValues: true,
                submitting: true,
                pristine: true,
              }}
              initialValuesEqual={isEqual}
              validate={this.validationHandler}
            >
              { ({ handleSubmit, form: { getState } }) => (
                <>
                  <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                  >
                    <div data-test-new-password-field>
                      <Row center="xs">
                        <Col
                          xs={12}
                          sm={6}
                        >
                          <FieldLabel htmlFor="new-password">
                            <FormattedMessage id={`${this.translationNamespaces.page}.newPassword`} />
                          </FieldLabel>
                        </Col>
                      </Row>
                      <Row
                        center="xs"
                        end="sm"
                      >
                        <Col
                          xs={12}
                          sm={9}
                        >
                          <Field
                            id="new-password"
                            name="newPassword"
                            autoComplete="new-password"
                            component={PasswordStrength}
                            inputClass={styles.input}
                            type={passwordType}
                            hasClearIcon={false}
                            autoFocus
                            errors={errors}
                            marginBottom0
                            fullWidth
                            inputColProps={this.inputColProps}
                            passwordMeterColProps={this.passwordMeterColProps}
                            onFocus={() => onPasswordInputFocus(submitIsFailed)}
                          />
                        </Col>
                      </Row>
                    </div>
                    <div data-test-password-requirements>
                      <Row center="xs">
                        <Col
                          xs={12}
                          sm={6}
                        >
                          <Layout className="textLeft padding-top-gutter padding-start-gutter">
                            <FormattedMessage id={`${this.translationNamespaces.page}.requirement.length`} />
                          </Layout>
                          <Layout className="textLeft padding-top-gutter padding-start-gutter">
                            <FormattedMessage id={`${this.translationNamespaces.page}.requirement.numeric`} />
                          </Layout>
                          <Layout className="textLeft padding-top-gutter padding-start-gutter">
                            <FormattedMessage id={`${this.translationNamespaces.page}.requirement.special`} />
                          </Layout>
                          <Layout className="textLeft padding-top-gutter padding-start-gutter">
                            <FormattedMessage id={`${this.translationNamespaces.page}.requirement.lowerAndUpperCase`} />
                          </Layout>
                        </Col>
                      </Row>
                    </div>
                    <div data-test-confirm-password-field>
                      <Row center="xs">
                        <Col
                          xs={12}
                          sm={6}
                        >
                          <FieldLabel htmlFor="confirm-password">
                            <FormattedMessage id={`${this.translationNamespaces.page}.confirmPassword`} />
                          </FieldLabel>
                        </Col>
                      </Row>
                      <Row
                        end="sm"
                        center="xs"
                        bottom="xs"
                      >
                        <Col
                          xs={12}
                          sm={6}
                        >
                          <div className={styles.formGroup}>
                            <Field
                              id="confirm-password"
                              component={TextField}
                              name="confirmPassword"
                              type={passwordType}
                              marginBottom0
                              fullWidth
                              inputClass={styles.input}
                              hasClearIcon={false}
                              autoComplete="new-password"
                            />
                          </div>
                        </Col>
                        <Col
                          sm={3}
                          xs={12}
                        >
                          <div
                            data-test-change-password-toggle-mask-btn
                            className={styles.toggleButtonWrapper}
                          >
                            <Button
                              type="button"
                              buttonStyle="link"
                              onClick={this.togglePasswordMask}
                            >
                              <FormattedMessage id={passwordToggleLabelId} />
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <Row center="xs">
                      <Col
                        xs={12}
                        sm={6}
                      >
                        <div
                          className={styles.formGroup}
                          data-test-submit
                        >
                          <Button
                            buttonStyle="primary"
                            id="clickable-login"
                            type="submit"
                            buttonClass={styles.submitButton}
                            disabled={isButtonDisabled(getState)}
                            fullWidth
                            marginBottom0
                          >
                            <FormattedMessage id={buttonLabelId} />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col
                        xs={12}
                        sm={6}
                      >
                        <div className={styles.authErrorsWrapper}>
                          <AuthErrorsContainer errors={errors} />
                        </div>
                      </Col>
                    </Row>
                  </form>
                  <FormSpy
                    subscription={{
                      pristine: true,
                    }}
                    onChange={this.onFormStateChange}
                  />
                </>
              )}
            </Form>
          </Row>
        </div>
      </div>
    );
  }
}

export default CreateResetPassword;

