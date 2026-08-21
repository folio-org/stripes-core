import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CreateResetPasswordControl from './CreateResetPasswordControl';

class CreateResetPasswordControlWrapper extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    stripes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedCreateResetPasswordControl = props.stripes.connect(CreateResetPasswordControl);
  }

  render() {
    return <this.connectedCreateResetPasswordControl {...this.props} />;
  }
}

export default CreateResetPasswordControlWrapper;
