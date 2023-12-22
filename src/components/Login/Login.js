import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';
import {
  withRouter,
  matchPath,
} from 'react-router-dom';

import { ConnectContext } from '@folio/stripes-connect';
import {
  requestLogin,
  requestSSOLogin,
} from '../../loginServices';
import { setAuthError } from '../../okapiActions';

class LoginCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    ssoEnabled: PropTypes.bool,
    autoLogin: PropTypes.shape({
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
    clearAuthErrors: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextType = ConnectContext;

  constructor(props) {
    super(props);
    this.sys = require('stripes-config'); // eslint-disable-line global-require
    this.authnUrl = this.sys.okapi.authnUrl;
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleSuccessfulLogin = () => {
    if (matchPath(this.props.location.pathname, '/login')) {
      this.props.history.push('/');
    }
  }

  handleSubmit = (data) => {
    return requestLogin({ okapi: this.sys.okapi }, this.context.store, this.tenant, data)
      .then(this.handleSuccessfulLogin)
      .catch(e => {
        console.error(e); // eslint-disable-line no-console
      });
  }

  handleSSOLogin = () => {
    requestSSOLogin(this.okapiUrl, this.tenant);
  }

  render() {
    const { authFailure, ssoEnabled } = this.props;

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
        render={({ form, submitting, handleSubmit, submitSucceeded, values }) => {
          const { username } = values;
          const submissionStatus = submitting || submitSucceeded;
          const buttonDisabled = submissionStatus || !(username) || !(navigator.cookieEnabled);
          const buttonLabel = submissionStatus ? 'loggingIn' : 'login';
          return (
            <main>
              <div className={styles.wrapper} style={branding?.style?.login ?? {}}>
                <div className={styles.container}>
                  <Row center="xs">
                    <Col xs={6}>
                      <OrganizationLogo />
                    </Col>
                  </Row>
                  <Row>
                    <form
                      className={styles.form}
                      onSubmit={data => handleSubmit(data).then(() => form.change('password', undefined))}
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
                              required
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
                            <AuthErrorsContainer errors={authErrors} />
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

const mapStateToProps = state => ({
  authFailure: state.okapi.authFailure,
  ssoEnabled: state.okapi.ssoEnabled,
});
const mapDispatchToProps = dispatch => ({
  clearAuthErrors: () => dispatch(setAuthError([])),
});

export default reduxConnect(mapStateToProps, mapDispatchToProps)(withRouter(LoginCtrl));
