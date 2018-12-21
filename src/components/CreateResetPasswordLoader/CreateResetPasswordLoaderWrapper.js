import React, { Component } from 'react';

import PropTypes from 'prop-types';
import LoaderCtrl from './CreateResetPasswordLoaderCtrl';

class CreateResetPasswordLoaderWrapper extends Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedLoaderCtrl = props.stripes.connect(LoaderCtrl);
  }

  render() {
    return <this.connectedLoaderCtrl {...this.props} />;
  }
}

export default CreateResetPasswordLoaderWrapper;
