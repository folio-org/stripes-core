import React, { Component, PropTypes } from 'react'; // eslint-disable-line

import Login from './Login';


class LoginCtrl extends Component {
  static contextTypes = {
    store: PropTypes.object,
    router: PropTypes.object,
  }

  static manifest = {
    currentUser : {},
    login : {
      type: 'okapi',
      path: 'authn/login',
      fetch: false
    }
  }

  constructor(props, context) {
    super();
    this.store = context.store;
    this.router = context.router;
    this.requestLogin = this.requestLogin.bind(this);
  }

  requestLogin (data) {
    this.props.mutator.currentUser.replace({});
    this.props.mutator.login.POST(data).then(() => {
      this.getUser(data.username);
      this.router.transitionTo("/");
    })
  }

  getUser (username) {
    var sys = require('stripes-loader!'); // eslint-disable-line
    const okapiUrl = sys.okapi.url;
    fetch(okapiUrl + '/users?query=(username="'+username+'")', {headers: Object.assign({}, {'X-Okapi-Tenant': sys.okapi.tenant, 'X-Okapi-Token': this.store.getState().okapi.token})})
      .then((response) => {
        if (response.status >= 400) {
          this.props.mutator.currentUser.replace({username: ''});
        } else {
          response.json().then((json) => {
            this.props.mutator.currentUser.replace({username: json.users[0].personal.full_name});
          });
        }
      });
  }

  render() {
    return <Login onSubmit={this.requestLogin} />;
  }
}

export default LoginCtrl;