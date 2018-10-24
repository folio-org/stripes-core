import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './FieldLabel.css';

export default class FieldLabel extends Component {
  static propTypes = {
    htmlFor: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired
  };

  render() {
    const {
      htmlFor,
      text
    } = this.props;

    return (
      <label
        htmlFor={htmlFor}
        className={styles.label}
      >
        {text}
      </label>
    );
  }
}
