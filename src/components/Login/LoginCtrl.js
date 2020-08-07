import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';

import { ConnectContext } from '@folio/stripes-connect';
import {
  requestLogin,
  requestSSOLogin,
} from '../../loginServices';
import { setAuthError } from '../../okapiActions';
import Login from './Login';

class LoginCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    ssoEnabled: PropTypes.bool,
    autoLogin: PropTypes.shape({
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
    clearAuthErrors: PropTypes.func.isRequired,
  };

  static contextType = ConnectContext;

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sys = require('stripes-config'); // eslint-disable-line global-require
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.handleSSOLogin = this.handleSSOLogin.bind(this);
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleSubmit(data) {
    return requestLogin(this.okapiUrl, this.context.store, this.tenant, data);
  }

  handleSSOLogin() {
    requestSSOLogin(this.okapiUrl, this.tenant);
  }

  render() {
    const { authFailure, ssoEnabled } = this.props;

    return (
      <Login
        onSubmit={this.handleSubmit}
        authErrors={authFailure}
        handleSSOLogin={this.handleSSOLogin}
        ssoActive={ssoEnabled}
      />
    );
  }
}

const mapStateToProps = state => ({
  authFailure: state.okapi.authFailure,
  ssoEnabled: state.okapi.ssoEnabled,
});
const mapDispatchToProps = dispatch => ({
  clearAuthErrors: () => dispatch(setAuthError([])),
});

export default reduxConnect(mapStateToProps, mapDispatchToProps)(LoginCtrl);
