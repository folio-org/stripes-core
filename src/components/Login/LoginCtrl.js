import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect as reduxConnect } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { requestLogin, requestSSOLogin } from '../../loginServices';
import Login from './Login';

class LoginCtrl extends Component {
  static propTypes = {
    authFailure: PropTypes.arrayOf(PropTypes.object),
    ssoEnabled: PropTypes.bool,
    autoLogin: PropTypes.shape({
      username: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
    stripes: PropTypes.shape({
      intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
      }),
    }).isRequired,
  };

  static contextTypes = {
    store: PropTypes.object,
  };

  constructor(props, context) {
    super(props);
    this.store = context.store;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sys = require('stripes-config'); // eslint-disable-line global-require
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.handleSSOLogin = this.handleSSOLogin.bind(this);
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  handleSubmit(data) {
    return requestLogin(this.okapiUrl, this.store, this.tenant, data).then((response) => {
      if (response.status >= 400) {
        // On login failure: Throw submission error
        // which triggers redux-form submitFailed prop
        throw new SubmissionError();
      }
    });
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
        stripes={this.props.stripes}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    authFailure: state.okapi.authFailure,
    ssoEnabled: state.okapi.ssoEnabled,
  };
}

export default reduxConnect(mapStateToProps)(LoginCtrl);
