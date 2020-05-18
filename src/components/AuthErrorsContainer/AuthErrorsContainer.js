import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
      <li
        key={`${code}-${type}`}
        aria-invalid
        aria-live="assertive"
        role="alert"
      >
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
      <ul
        className={styles.AuthErrorsList}
        tabIndex="0" // eslint-disable-line jsx-a11y/no-noninteractive-tabindex
      >
        {messages}
      </ul>
    );
  }

  render() {
    return (
      <div className={styles.AuthErrorsContainer}>
        {this.renderErrors()}
      </div>
    );
  }
}
