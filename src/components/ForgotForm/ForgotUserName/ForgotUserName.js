import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field, Form } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import {
  TextField,
  Button,
  Headline
} from '../../../../../stripes-components/index';
import OrganizationLogo from '../../OrganizationLogo/OrganizationLogo';
import formStyles from '../../Login/AuthForm.css';

class ForgotUserName extends Component {
  static propTypes = {
    dirty: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
  };

  render() {
    const { dirty } = this.props;
    return (
      <Fragment>
        <div className={formStyles.wrap}>
          <div className={formStyles.centered}>
            <OrganizationLogo />
            <Form
              className={formStyles.form}
              onSubmit={this.props.onSubmit}
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
                  name="email-or-phone"
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
