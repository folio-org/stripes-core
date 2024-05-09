import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field, Form } from 'react-final-form';

import { branding } from 'stripes-config';

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
    ssoActive: PropTypes.bool,
    authErrors: PropTypes.arrayOf(PropTypes.object),
    onSubmit: PropTypes.func.isRequired,
    handleSSOLogin: PropTypes.func.isRequired,
  };

  static defaultProps = {
    authErrors: [],
    ssoActive: false,
  };

  render() {
    const {
      authErrors,
      handleSSOLogin,
      ssoActive,
      onSubmit,
    } = this.props;

    const cookieMessage = navigator.cookieEnabled ?
      '' :
      (
        <Row center="xs">
          <Col xs={6}>
            <Headline
              size="large"
              tag="h3"
            >
              <FormattedMessage id="stripes-core.title.cookieEnabled" />
            </Headline>
          </Col>
        </Row>);

    return (
      <Form
        onSubmit={onSubmit}
        subscription={{ values: true }}
        mutators={{
          setError: (args, state, tools) => {
            const errors = args.length ? args : authErrors;
            tools.changeValue(state, 'authErrors', () => errors);
          },
        }}
        render={({ form, submitting, handleSubmit, submitSucceeded, values }) => {
          const { username } = values;
          const submissionStatus = submitting || submitSucceeded;
          const buttonDisabled = submissionStatus || !(username) || !(navigator.cookieEnabled);
          const buttonLabel = submissionStatus ? 'loggingIn' : 'login';
          return (
            <main>
              <div className={styles.wrapper} style={branding.style?.login ?? {}}>
                <div className={styles.container}>
                  <Row center="xs">
                    <Col xs={6}>
                      <OrganizationLogo />
                    </Col>
                  </Row>
                  <Row>
                    <form
                      className={styles.form}
                      onSubmit={data => handleSubmit(data)
                        .then(() => {
                          form.mutators.setError();
                          form.change('password', undefined);
                        })
                        .catch(() => {
                          const emptyPasswordError = { code: 'password.empty' };
                          form.mutators.setError(emptyPasswordError);
                        })}
                    >
                      <Row center="xs">
                        <Col xs={6}>
                          <div className={styles.formGroup}>
                            {ssoActive && <SSOLogin handleSSOLogin={handleSSOLogin} />}
                          </div>
                        </Col>
                      </Row>
                      <Row center="xs">
                        <Col xs={6}>
                          <Headline
                            size="xx-large"
                            tag="h1"
                            data-test-h1
                          >
                            <FormattedMessage id="stripes-core.title.login" />
                          </Headline>
                        </Col>
                      </Row>
                      { cookieMessage }
                      <div data-test-new-username-field>
                        <Row center="xs">
                          <Col xs={6}>
                            <Row
                              between="xs"
                              bottom="xs"
                            >
                              <Col xs={3}>
                                <FieldLabel htmlFor="input-username">
                                  <FormattedMessage id="stripes-core.username" />
                                </FieldLabel>
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
                              inputClass={styles.loginInput}
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
                                <FieldLabel htmlFor="input-password">
                                  <FormattedMessage id="stripes-core.password" />
                                </FieldLabel>
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
                              value=""
                              marginBottom0
                              fullWidth
                              inputClass={styles.loginInput}
                              validationEnabled={false}
                              hasClearIcon={false}
                              autoComplete="current-password"
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
                              buttonClass={styles.loginSubmitButton}
                              disabled={buttonDisabled}
                              fullWidth
                              marginBottom0
                            >
                              <FormattedMessage id={`stripes-core.${buttonLabel}`} />
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      <Row
                        className={styles.linksWrapper}
                        center="xs"
                      >
                        <Col xs={6}>
                          <Row between="xs">
                            <Col
                              xs={12}
                              sm={6}
                              md={4}
                              data-test-new-forgot-password-link
                            >
                              <Button
                                to="/forgot-password"
                                buttonClass={styles.link}
                                type="button"
                                buttonStyle="link"
                              >
                                <FormattedMessage id="stripes-core.button.forgotPassword" />
                              </Button>
                            </Col>
                            <Col
                              xs={12}
                              sm={6}
                              md={4}
                              data-test-new-forgot-username-link
                            >
                              <Button
                                to="/forgot-username"
                                buttonClass={styles.link}
                                type="button"
                                buttonStyle="link"
                              >
                                <FormattedMessage id="stripes-core.button.forgotUsername" />
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <Row center="xs">
                        <Col xs={6}>
                          <div className={styles.authErrorsWrapper}>
                            <AuthErrorsContainer errors={form.getState().values.authErrors} />
                          </div>
                        </Col>
                      </Row>
                    </form>
                    {ssoActive && <form id="ssoForm" />}
                  </Row>
                </div>
              </div>
            </main>
          );
        }}
      />
    );
  }
}

export default Login;
