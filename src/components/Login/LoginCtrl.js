import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import { connect as reduxConnect } from 'react-redux'; // eslint-disable-line

import { requestLogin, checkUser } from '../../loginServices';
import Login from './Login';

class LoginCtrl extends Component {
  static contextTypes = {
    store: PropTypes.object,
    router: PropTypes.object,
    authFail: PropTypes.bool,
  }

  static propTypes = {
    authFail: PropTypes.bool,
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
    this.sys = require('stripes-loader'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.initialValues = { username: '', password: '' };
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

  render() {
    const authFail = this.props.authFail;
    checkUser(this.okapiUrl, this.store, this.tenant);
    return (
      <Login
        onSubmit={this.handleSubmit}
        authFail={authFail}
        initialValues={this.initialValues}
      />
    );
  }
}

function mapStateToProps(state) {
  return { authFail: state.okapi.authFailure };
}

export default reduxConnect(mapStateToProps)(LoginCtrl);
