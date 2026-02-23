import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { FormattedMessage, useIntl } from 'react-intl';

import {
  Button,
  Col,
  Headline,
  Row,
  TextField,
} from '@folio/stripes-components';

import { forgotFormErrorCodes } from '../../constants';
import FieldLabel from '../CreateResetPassword/components/FieldLabel';
import OrganizationLogo from '../OrganizationLogo';
import AuthErrorsContainer from '../AuthErrorsContainer';
import { useStripes } from '../../StripesContext';
import SelectAndDispatchTenant from '../SelectAndDispatchTenant';

import styles from '../Login/Login.css';

const ForgotUserNameForm = ({ errors = [], isValid, onSubmit }) => {
  const { branding, okapi } = useStripes();
  const intl = useIntl();
  const forgotUsernamePlaceholder = intl.formatMessage({ id: 'stripes-core.placeholder.forgotUsername' });

  return (
    <Form
      onSubmit={onSubmit}
      render={({ handleSubmit, pristine }) => (
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
                  data-form="forgot"
                  onSubmit={handleSubmit}
                >
                  <Row center="xs">
                    <Col xs={6}>
                      <Headline
                        size="xx-large"
                        tag="h1"
                        data-test-h1
                      >
                        <FormattedMessage id="stripes-core.label.forgotUsername" />
                      </Headline>
                    </Col>
                  </Row>
                  <SelectAndDispatchTenant styles={styles} />
                  <div data-test-new-username-field>
                    <Row center="xs">
                      <Col xs={6}>
                        <Row
                          between="xs"
                          bottom="xs"
                        >
                          <Col xs={6}>
                            <FieldLabel htmlFor="input-email-or-phone">
                              {forgotUsernamePlaceholder}
                            </FieldLabel>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <Row center="xs">
                      <Col xs={6}>
                        <Field
                          id="input-email-or-phone"
                          component={TextField}
                          name="userInput"
                          type="text"
                          marginBottom0
                          fullWidth
                          inputClass={styles.loginInput}
                          validationEnabled={false}
                          hasClearIcon={false}
                          autoCapitalize="none"
                          required
                          value=""
                          placeholder={forgotUsernamePlaceholder}
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
                          disabled={pristine || !okapi.tenant}
                          fullWidth
                          marginBottom0
                        >
                          <FormattedMessage id="stripes-core.button.continue" />
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Row center="xs">
                    <Col xs={6}>
                      <div className={styles.authErrorsWrapper}>
                        <AuthErrorsContainer
                          errors={!isValid
                            ? [{ code: forgotFormErrorCodes.EMAIL_INVALID }]
                            : errors
                          }
                          data-test-container
                        />
                      </div>
                    </Col>
                  </Row>
                </form>
              </Row>
            </div>
          </div>
        </main>
      )}
    />
  );
};

ForgotUserNameForm.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.object),
  isValid: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ForgotUserNameForm;
