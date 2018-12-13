import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  reduxForm,
  Field,
  Form,
} from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';

import {
  TextField,
  Button,
  Headline,
  Row,
  Col,
} from '@folio/stripes-components';

import { forgotFormErrorCodes } from '../../constants';
import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';

import formStyles from './ForgotUserNameForm.css';

class ForgotUserName extends Component {
  static propTypes = {
    dirty: PropTypes.bool.isRequired,
    isValid: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    errors: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    errors: []
  };

  isErrorsContainerPresent() {
    const {
      errors,
      isValid,
    } = this.props;

    return !isEmpty(errors) || !isValid;
  }

  render() {
    const {
      dirty,
      onSubmit,
      handleSubmit,
      isValid,
      errors
    } = this.props;

    const hasErrorsContainer = this.isErrorsContainerPresent();

    return (
      <Fragment>
        <div className={formStyles.wrap}>
          <div className={formStyles.centered}>
            <OrganizationLogo />
            <Form
              className={formStyles.form}
              data-form="forgot"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Headline
                size="xx-large"
                tag="h1"
                data-test-h1
              >
                <FormattedMessage id="stripes-core.label.forgotUsername" />
              </Headline>
              <Headline
                size="large"
                tag="p"
                bold={false}
                faded
                data-test-p
              >
                <FormattedMessage id="stripes-core.label.forgotUsernameOrPasswordCallToAction" />
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
                <FormattedMessage id="stripes-core.button.continue" />
              </Button>
              <Row center="xs">
                <Col xs={12}>
                  <div
                    className={formStyles.authErrorsWrapper}
                    data-test-errors
                  >
                    {hasErrorsContainer && (
                      <AuthErrorsContainer
                        errors={!isValid
                          ? [{ code: forgotFormErrorCodes.EMAIL_INVALID }]
                          : errors
                        }
                        data-test-container
                      />
                    )}
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Fragment>
    );
  }
}

const ForgotUserNameForm = reduxForm(
  { form: 'forgot-user-name' }
)(ForgotUserName);
export default ForgotUserNameForm;
