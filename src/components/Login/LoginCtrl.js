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
  storeLogoutTenant,
} from '../../loginServices';
import { setAuthError } from '../../okapiActions';
import Login from './Login';

class LoginCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    ssoEnabled: PropTypes.bool,
    okapiUrl: PropTypes.string.isRequired,
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
    this.tenant = this.sys.okapi.tenant;
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  componentWillUnmount() {
    this.props.clearAuthErrors();
  }

  /**
   * handleSubmit
   * 1 Submit the API request via requestLogin, which will process a successful
   *   response and initialize the session, and return the response JSON.
   * 2 Grab token-expiration data and configure end-of-session timers.
   * 3 Update location, if necessary
   * 4 Store the tenant we logged in with, for use in logout API requests
   *
   * @param {object} data { username, password }
   */
  handleSubmit = async (data) => {
    try {
      const json = await requestLogin(this.props.okapiUrl, this.context.store, this.tenant, data);
      await this.props.stripes.handleRotation(json.tokenExpiration);
      if (matchPath(this.props.location.pathname, '/login')) {
        this.props.history.push('/');
      }
      storeLogoutTenant(this.tenant);
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }
  }

  handleSSOLogin = () => {
    requestSSOLogin(this.props.okapiUrl, this.tenant);
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
  okapiUrl: state.okapi.url,
});
const mapDispatchToProps = dispatch => ({
  clearAuthErrors: () => dispatch(setAuthError([])),
});

export default reduxConnect(mapStateToProps, mapDispatchToProps)(withRouter(LoginCtrl));
