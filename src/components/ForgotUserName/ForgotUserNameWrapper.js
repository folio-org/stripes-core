import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ForgotUserNameCtrl from './ForgotUserNameCtrl';

class ForgotUserNameWrapper extends Component {
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

    this.connectedForgotUserNameCtrl = props.stripes.connect(ForgotUserNameCtrl);
  }

  render() {
    return <this.connectedForgotUserNameCtrl {...this.props} />;
  }
}

export default ForgotUserNameWrapper;
