import React, { useState, useRef, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import { branding } from 'stripes-config';

import {
  TextField,
  Button,
  Row,
  Col,
  Headline,
  nativeChangeFieldValue,
} from '@folio/stripes-components';

import SSOLogin from '../SSOLogin';
import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';
import FieldLabel from '../CreateResetPassword/components/FieldLabel';

import styles from './Login.css';

const Login = ({
  authErrors = [],
  ssoActive = false,
  onSubmit,
  handleSSOLogin,
}) => {
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [buttonLabel, setButtonLabel] = useState('login');
  const field = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    setButtonLabel('loggingIn');
    await onSubmit(data);
    nativeChangeFieldValue(field, false, '', true);
    data = null;
    setButtonLabel('login');
  };

  const handleChange = (e) => {
    const disable = Boolean(!e.target.value);
    setButtonDisabled(disable);
  };

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
              onSubmit={handleSubmit}
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
                    <TextField
                      id="input-username"
                      name="username"
                      inputClass={styles.input}
                      autoComplete="username"
                      autoCapitalize="none"
                      validationEnabled={false}
                      hasClearIcon={false}
                      onChange={handleChange}
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
                    <TextField
                      id="input-password"
                      name="password"
                      type="password"
                      marginBottom0
                      fullWidth
                      inputClass={styles.input}
                      validationEnabled={false}
                      hasClearIcon={false}
                      autoComplete="current-password"
                      inputRef={field}
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
};

Login.propTypes = {
  ssoActive: PropTypes.bool,
  authErrors: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func.isRequired,
  handleSSOLogin: PropTypes.func.isRequired,
};

export default Login;
