import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Label } from '@folio/stripes-components';

import styles from './FieldLabel.css';

export default class FieldLabel extends Component {
  static propTypes = {
    htmlFor: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    required: PropTypes.bool,
  };

  static defaultProps = {
    required: false,
  };

  render() {
    const {
      htmlFor,
      children,
      required,
    } = this.props;

    return (
      <Label
        htmlFor={htmlFor}
        className={styles.label}
        required={required}
      >
        {children}
      </Label>
    );
  }
}
