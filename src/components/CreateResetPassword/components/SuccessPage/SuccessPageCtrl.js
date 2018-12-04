import React, { Component } from 'react';
import {
  withRouter,
  Redirect,
} from 'react-router-dom';

import SuccessPage from './SuccessPage';

class SuccessPageCtrl extends Component {
    state = {
      isRedirectButtonClicked: false,
    };

    handleRedirectButtonClick = () => {
      this.setState({ isRedirectButtonClicked: true });
    };

    render() {
      const { isRedirectButtonClicked } = this.state;

      if (isRedirectButtonClicked) {
        return <Redirect
          to="/login"
          push
        />;
      }

      return <SuccessPage handleClick={this.handleRedirectButtonClick} />;
    }
}

export default withRouter(SuccessPageCtrl);
