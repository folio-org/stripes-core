import React, { Component, PropTypes } from 'react'; // eslint-disable-line

import Login from './Login';

export default class LoginCtrl extends Component {
  static contextTypes = {
    store: PropTypes.object,
    router: PropTypes.object,
  }

  constructor(props, context) {
    super();
    this.store = context.store;
    this.router = context.router;
    this.requestLogin = this.requestLogin.bind(this);
    this.sys = require('stripes-loader!'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
  }

  setCurrentUser(username) {
    return {
      "type": "SET_CURRENT_USER",
      "username": username,
    }
  }

  getUser(username) {
    fetch(`${this.okapiUrl}/users?query=(username="${username}")`, { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        if (response.status >= 400) {
          this.store.dispatch(this.setCurrentUser(''));
        } else {
          response.json().then((json) => {
            this.store.dispatch(this.setCurrentUser(json.users[0].personal.full_name));
          });
        }
      });
  }


  setOkapiToken(token) {
    return {
      type: 'SET_OKAPI_TOKEN',
      token,
    };
  }

  clearOkapiToken() {
    return {
      type: 'CLEAR_OKAPI_TOKEN',
    };
  }


  requestLogin(data) {
    fetch(`${this.okapiUrl}/authn/login`, {
        method: 'POST',
        headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant } ),
        body: JSON.stringify(data),
      }).then((response) => {
        if (response.status >= 400) {
          console.log("Request login responded: Authentication error");
          this.store.dispatch(this.clearOkapiToken());
        } else {
          let token = response.headers.get('X-Okapi-Token');
          console.log("Request login responded: Authentication with token: ", token);
          this.store.dispatch(this.setOkapiToken(token));
          this.getUser(data.username);
        }
    });
  }

  render() {
    return <Login onSubmit={this.requestLogin} />;
  }
}
