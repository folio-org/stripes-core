import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { MessageBanner } from '@folio/stripes-components';

import { FormattedMessage } from 'react-intl';

import styles from './AuthErrorsContainer.css';

export default class AuthErrorsContainer extends Component {
  static propTypes = {
    errors: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  getErrorMessage(error) {
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
  }

  renderErrors() {
    const { errors } = this.props;
    const messages = errors.map(this.getErrorMessage);

    return (
      <ul>
        {messages}
      </ul>
    );
  }

  render() {
    const { errors } = this.props;
    const hasErrors = Array.isArray(errors) && errors.length;

    return (
      <MessageBanner
        show={hasErrors}
        type="error"
        aria-live="assertive"
        className={styles.AuthErrorsContainer}
      >
        {this.renderErrors()}
      </MessageBanner>
    );
  }
}
