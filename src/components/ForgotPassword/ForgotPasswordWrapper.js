import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ForgotPasswordCtrl from './ForgotPasswordCtrl';

class ForgotPasswordWrapper extends Component {
  static propTypes = {
    mutator: PropTypes.shape({
      searchUsername: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    stripes: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.connectedForgotPasswordCtrl = props.stripes.connect(ForgotPasswordCtrl);
  }

  render() {
    return <this.connectedForgotPasswordCtrl {...this.props} />;
  }
}

export default ForgotPasswordWrapper;
