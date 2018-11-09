import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, Form } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-flexbox-grid';

import TextField from '@folio/stripes-components/lib/TextField';
import Button from '@folio/stripes-components/lib/Button';
import Headline from '@folio/stripes-components/lib/Headline';
import OrganizationLogo from '../../OrganizationLogo/OrganizationLogo';
import AuthErrorsContainer from '../../AuthErrorsContainer';

import formStyles from '../../Login/AuthForm.css';
import errorContainerStyles
  from '../../CreateResetPassword/CreateResetPassword.css';

class ForgotUserName extends Component {
  static propTypes = {
    dirty: PropTypes.bool,
    isValid: PropTypes.bool,
    userExists: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
  };

  render() {
    const {
      dirty,
      onSubmit,
      handleSubmit,
      isValid,
      userExists,
    } = this.props;

    return (
      <Fragment>
        <div className={formStyles.wrap}>
          <div className={formStyles.centered}>
            <OrganizationLogo />
            <Form
              className={formStyles.form}
              onSubmit={handleSubmit(onSubmit)}
              data-form="forgot"
            >
              <Headline
                size="xx-large"
                tag="h1"
                data-test-h1
              >
                <FormattedMessage
                  id="stripes-core.label.forgotUsername"
                />
              </Headline>
              <Headline
                size="large"
                tag="p"
                bold={false}
                faded
                data-test-p
              >
                <FormattedMessage
                  id="stripes-core.label.forgotUsernameOrPasswordCallToAction"
                />
              </Headline>
              <div className={formStyles.formGroup}>
                <Field
                  id="input-email-or-phone"
                  component={TextField}
                  name="userInput"
                  type="text"
                  marginBottom0
                  fullWidth
                  inputClass={formStyles.input}
                  validationEnabled={false}
                  hasClearIcon={false}
                  autoComplete="email-or-phone"
                  autoCapitalize="none"
                  autoFocus
                />
              </div>
              <Button
                buttonStyle="primary"
                id="clickable-login"
                name="continue-button"
                type="submit"
                buttonClass={formStyles.submitButton}
                disabled={!dirty}
                fullWidth
                marginBottom0
                data-test-submit
              >
                <FormattedMessage
                  id="stripes-core.button.continue"
                />
              </Button>
              <div
                className={errorContainerStyles.authErrorsWrapper}
                data-test-errors
              >
                { (!isValid || !userExists) &&
                <Row center="xs">
                  <Col xs={12}>
                    <AuthErrorsContainer
                      errors={
                        isValid
                          ? [{ code: 'unable.locate.account' }]
                          : [{ code: 'email.invalid' }]
                      }
                      data-test-container
                    />
                  </Col>
                </Row>
                    }
              </div>
            </Form>
          </div>
        </div>
      </Fragment>
    );
  }
}

const ForgotUserNameForm =
  reduxForm({ form: 'forgot-user-name' })(ForgotUserName);
export default ForgotUserNameForm;
