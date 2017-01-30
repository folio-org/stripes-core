import React, { Component, PropTypes } from 'react'; // eslint-disable-line

import { setCurrentUser, clearCurrentUser, setOkapiToken, clearOkapiToken } from '../../okapiActions'

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


  getUser(username) {
    fetch(`${this.okapiUrl}/users?query=(username="${username}")`, { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant, 'X-Okapi-Token': this.store.getState().okapi.token }) })
      .then((response) => {
        if (response.status >= 400) {
          this.store.dispatch(clearCurrentUser());
        } else {
          response.json().then((json) => {
            this.store.dispatch(setCurrentUser(json.users[0].personal.full_name));
          });
        }
      });
  }

  requestLogin(data) {
    fetch(`${this.okapiUrl}/authn/login`, {
        method: 'POST',
        headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant } ),
        body: JSON.stringify(data),
      }).then((response) => {
        if (response.status >= 400) {
          console.log("Request login responded: Authentication error");
          this.store.dispatch(clearOkapiToken());
        } else {
          let token = response.headers.get('X-Okapi-Token');
          console.log("Request login responded: Authentication with token: ", token);
          this.store.dispatch(setOkapiToken(token));
          this.getUser(data.username);
        }
    });
  }

  render() {
    return <Login onSubmit={this.requestLogin} />;
  }
}
