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
      type,
      parameters = [],
    } = error;

    const values = parameters.reduce((res, { key, value }) => ({ ...res, [key]: value }), {});

    return (
      <li key={`${code}-${type}`}>
        <FormattedMessage
          id={`stripes-core.errors.${code}`}
          values={values}
        />
      </li>
    );
  }

  renderErrors() {
    const { errors } = this.props;
    const messages = errors.map(this.getErrorMessage);

    return (
      <ul className={styles.AuthErrorsList}>
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
