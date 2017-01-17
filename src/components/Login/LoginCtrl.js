import React, { Component, PropTypes } from 'react'; // eslint-disable-line

import Login from './Login';


class LoginCtrl extends Component {
  static manifest = {
    login : {
      type: 'okapi',
      path: 'authn/login',
      fetch: false
    }
  }

  constructor(props) {
    super();
    this.requestLogin = this.requestLogin.bind(this);
  }

  requestLogin (data) {
    this.props.mutator.login.POST(data);
  }

  render() {
    return <Login onSubmit={this.requestLogin} />;
  }
}

export default LoginCtrl;