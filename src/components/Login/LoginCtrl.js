import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';
import {
  withRouter,
  matchPath,
} from 'react-router-dom';
import { okapi } from 'stripes-config';


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
    this.tenant = okapi.tenant;
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

    // need to store tenant id in localStorage for logout purposes
    // `logout` function in loginServices.js provides details about this.
    storeLogoutTenant(this.tenant);
  }

  handleSubmit = (data) => {
    return requestLogin(this.props.okapiUrl, this.context.store, this.tenant, data)
      .then(this.handleSuccessfulLogin)
      .catch(e => {
        console.error(e); // eslint-disable-line no-console
      });
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
