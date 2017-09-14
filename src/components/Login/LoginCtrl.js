import React, { Component } from 'react'; // eslint-disable-line
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux'; // eslint-disable-line

import { requestLogin, requestSSOLogin } from '../../loginServices';
import Login from './Login';

class LoginCtrl extends Component {
  static contextTypes = {
    store: PropTypes.object,
    router: PropTypes.object,
    authFail: PropTypes.bool,
  }

  static propTypes = {
    authFail: PropTypes.bool,
    ssoEnabled: PropTypes.bool,
    autoLogin: PropTypes.shape({
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
  }

  constructor(props, context) {
    super(props);
    this.store = context.store;
    this.router = context.router;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sys = require('stripes-config'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.initialValues = { username: '', password: '' };
    this.handleSSOLogin = this.handleSSOLogin.bind(this);
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  handleSubmit(data) {
    requestLogin(this.okapiUrl, this.store, this.tenant, data).then((response) => {
      if (response.status >= 400) {
        // eslint-disable-next-line no-param-reassign
        this.initialValues.username = data.username;
      }
    });
  }

  handleSSOLogin() {
    requestSSOLogin(this.okapiUrl, this.tenant);
  }

  render() {
    const { authFail, ssoEnabled } = this.props;

    return (
      <Login
        onSubmit={this.handleSubmit}
        authFail={authFail}
        initialValues={this.initialValues}
        handleSSOLogin={this.handleSSOLogin}
        ssoActive={ssoEnabled}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    authFail: state.okapi.authFailure,
    ssoEnabled: state.okapi.ssoEnabled,
  };
}

export default reduxConnect(mapStateToProps)(LoginCtrl);
