/**
 * AuthErrorsContainer
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MessageBanner } from '@folio/stripes-components';
import styles from './AuthErrorsContainer.css';

const AuthErrorsContainer = ({ errors }) => {
  const hasErrors = Array.isArray(errors) && !!errors.length;

  const getErrorMessage = (error) => {
    const {
      code,
      type = 'error',
      parameters = [],
      translationNamespace = 'stripes-core.errors',
    } = error;

    const values = parameters.reduce((res, { key, value }) => ({ ...res, [key]: value }), {});

    return (
      <li key={`${code}-${type}`}>
        <FormattedMessage
          id={`${translationNamespace}.${code}`}
          values={values}
        />
      </li>
    );
  };

  return (
    <MessageBanner
      show={hasErrors}
      type="error"
      aria-live="assertive"
      className={styles.AuthErrorsContainer}
    >
      { hasErrors && (
        <ul>
          {errors.map(getErrorMessage)}
        </ul>
      )}
    </MessageBanner>
  );
};

AuthErrorsContainer.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.object),
};

export default AuthErrorsContainer;
