import React, { Component, PropTypes } from 'react'; // eslint-disable-line

import { connect as reduxConnect } from 'react-redux'; // eslint-disable-line

import { reset } from 'redux-form';

import { setCurrentUser, setCurrentPerms, clearCurrentUser, setLocale, setOkapiToken, clearOkapiToken, authFailure, clearAuthFailure } from '../../okapiActions';
import Login from './Login';

class LoginCtrl extends Component {
  static contextTypes = {
    store: PropTypes.object,
    router: PropTypes.object,
    authFail: PropTypes.bool,
  }

  static propTypes = {
    authFail: PropTypes.bool,
  }

  constructor(props, context) {
    super();
    this.store = context.store;
    this.router = context.router;
    this.requestLogin = this.requestLogin.bind(this);
    this.sys = require('stripes-loader'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.store.dispatch(clearAuthFailure());
    this.initialValues = { username: '', password: '' };
  }


  getUser(username) {
    fetch(`${this.okapiUrl}/users?query=(username="${username}")`, { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        if (response.status >= 400) {
          this.store.dispatch(clearCurrentUser());
        } else {
          response.json().then((json) => {
            this.store.dispatch(setCurrentUser(json.users[0].personal));
          });
        }
      });
  }

  getPerms(username) {
    fetch(`${this.okapiUrl}/perms/users/${username}/permissions?expanded=true&full=true`,
          { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        if (response.status >= 400) {
          this.store.dispatch(clearCurrentUser());
        } else {
          response.json().then((json) => {
            // You are not expected to understand this
            const map = Object.assign({}, ...json.permissionNames.map(p => ({ [p.permissionName]: true })));
            this.store.dispatch(setCurrentPerms(map));
          });
        }
      });
  }

  getLocale() {
    fetch(`${this.okapiUrl}/configurations/entries?query=(module=ORG and config_name=locale)`,
          { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        let locale = 'en-US';
        if (response.status >= 400) {
          this.store.dispatch(setLocale(locale));
        } else {
          response.json().then((json) => {
            const configs = json.configs;
            if (configs.length > 0) locale = configs[0].value;
            this.store.dispatch(setLocale(locale));
          });
        }
      });
  }

  requestLogin(data) {
    fetch(`${this.okapiUrl}/authn/login`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status >= 400) {
        this.store.dispatch(clearOkapiToken());
        this.store.dispatch(reset('login'));
        this.initialValues.username = data.username;
        this.store.dispatch(authFailure());
      } else {
        const token = response.headers.get('X-Okapi-Token');
        this.store.dispatch(setOkapiToken(token));
        this.store.dispatch(clearAuthFailure());
        this.getUser(data.username);
        this.getPerms(data.username);
        this.getLocale();
      }
    });
  }

  render() {
    const authFail = this.props.authFail;
    return (
      <Login
        onSubmit={this.requestLogin}
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
