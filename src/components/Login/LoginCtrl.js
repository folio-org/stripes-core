import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import { connect as reduxConnect } from 'react-redux'; // eslint-disable-line
import { reset } from 'redux-form';
import localforage from 'localforage';

import { setCurrentUser, clearCurrentUser, setCurrentPerms, setLocale, setPlugins, setBindings, setOkapiToken, clearOkapiToken, authFailure, clearAuthFailure } from '../../okapiActions';
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
    super();
    this.store = context.store;
    this.router = context.router;
    this.requestLogin = this.requestLogin.bind(this);
    this.sys = require('stripes-loader'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
    this.initialValues = { username: '', password: '' };
    if (props.autoLogin && props.autoLogin.username) {
      this.requestLogin(props.autoLogin);
    }
  }


  getLocale() {
    fetch(`${this.okapiUrl}/configurations/entries?query=(module=ORG and configName=locale)`,
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

  getPlugins() {
    fetch(`${this.okapiUrl}/configurations/entries?query=(module=PLUGINS)`,
          { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        if (response.status < 400) {
          response.json().then((json) => {
            const configs = json.configs.reduce((acc, val) => ({
              ...acc,
              [val.configName]: val.value,
            }), {});
            this.store.dispatch(setPlugins(configs));
          });
        }
      });
  }

  getBindings() {
    fetch(`${this.okapiUrl}/configurations/entries?query=(module=ORG and configName=bindings)`,
          { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        let bindings = {};
        if (response.status >= 400) {
          this.store.dispatch(setBindings(bindings));
        } else {
          response.json().then((json) => {
            const configs = json.configs;
            if (configs.length > 0) {
              const string = configs[0].value;
              try {
                const tmp = JSON.parse(string);
                bindings = tmp; // only if no exception is thrown
              } catch (err) {
                // eslint-disable-next-line no-console
                console.log(`getBindings cannot parse key bindings '${string}':`, err);
              }
            }
            this.store.dispatch(setBindings(bindings));
          });
        }
      });
  }

  requestLogin(data) {
    fetch(`${this.okapiUrl}/bl-users/login?expandPermissions=true&fullPermissions=true`, {
      method: 'POST',
      headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    }).then((response) => {
      if (response.status >= 400) {
        this.store.dispatch(clearCurrentUser());
        this.store.dispatch(clearOkapiToken());
        localforage.removeItem('okapiSess');
        this.store.dispatch(reset('login'));
        this.initialValues.username = data.username;
        this.store.dispatch(authFailure());
      } else {
        const token = response.headers.get('X-Okapi-Token');
        this.store.dispatch(setOkapiToken(token));
        this.store.dispatch(clearAuthFailure());
        response.json().then((json) => {
          this.store.dispatch(setCurrentUser(json.user.personal));
          // You are not expected to understand this
          // ...then aren't you expected to explain it?
          const map = Object.assign({}, ...json.permissions.permissions.map(p => ({ [p.permissionName]: true })));
          this.store.dispatch(setCurrentPerms(map));
          const okapiSess = {
            token,
            user: json.user.personal,
            perms: map,
          };
          localforage.setItem('okapiSess', okapiSess);
        });
        this.getLocale();
        this.getPlugins();
        this.getBindings();
      }
    });
  }

  render() {
    const authFail = this.props.authFail;
    localforage.getItem('okapiSess').then((sess) => {
      if (sess !== null) {
        // Validate stored token by attempting to fetch /users
        fetch(`${this.okapiUrl}/users`, {
          method: 'GET',
          headers: {
            'X-Okapi-Tenant': this.tenant,
            'X-Okapi-Token': sess.token,
            'Content-Type': 'application/json',
          },
        }).then((response) => {
          if (response.status >= 400) {
            this.store.dispatch(clearCurrentUser());
            this.store.dispatch(clearOkapiToken());
            localforage.removeItem('okapiSess');
          } else {
            this.store.dispatch(setOkapiToken(sess.token));
            this.store.dispatch(setCurrentUser(sess.user));
            this.store.dispatch(setCurrentPerms(sess.perms));
            this.getLocale();
            this.getPlugins();
            this.getBindings();
          }
        });
      }
    });
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
