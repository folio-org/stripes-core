import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';
import {
  withRouter,
  matchPath,
} from 'react-router-dom';

import { ConnectContext } from '@folio/stripes-connect';
import {
  requestLogin,
  requestSSOLogin,
} from '../../loginServices';
import { setAuthError } from '../../okapiActions';
import LoginForm from './LoginForm';

class LoginCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    ssoEnabled: PropTypes.bool,
    autoLogin: PropTypes.shape({
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
    clearAuthErrors: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  };

  static contextType = ConnectContext;

  constructor(props) {
    super(props);
    this.sys = require('stripes-config'); // eslint-disable-line global-require
    this.authnUrl = this.sys.okapi.authnUrl;
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  handleSuccessfulLogin = () => {
    if (matchPath(this.props.location.pathname, '/login')) {
      this.props.history.push('/');
    }
  }

  handleSubmit = (data) => {
    return requestLogin({ okapi: this.sys.okapi }, this.context.store, this.tenant, data)
      .then(this.handleSuccessfulLogin)
      .catch(e => {
        console.error(e); // eslint-disable-line no-console
      });
  }

  handleSSOLogin = () => {
    requestSSOLogin(this.okapiUrl, this.tenant);
  }

  render() {
    const { authFailure, ssoEnabled } = this.props;

    return (
      <LoginForm
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

export default reduxConnect(mapStateToProps, mapDispatchToProps)(withRouter(LoginCtrl));
