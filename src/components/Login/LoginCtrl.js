import React, { Component, PropTypes } from 'react'; // eslint-disable-line
import { connect as reduxConnect } from 'react-redux'; // eslint-disable-line

import { requestLogin, checkUser } from '../../loginServices';
import Login from './Login';
import SSOLogin from '../SSOLogin';
import css from './Login.css';

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
    this.ssoUrl = `${this.okapiUrl}/saml/login`;
    this.state = {};
    this.handleSSOLogin = this.handleSSOLogin.bind(this);
    if (props.autoLogin && props.autoLogin.username) {
      this.handleSubmit(props.autoLogin);
    }
  }

  componentDidMount() {
    fetch(`${this.okapiUrl}/saml/check`,
          { headers: Object.assign({}, { 'X-Okapi-Tenant': this.tenant }) })
      .then((response) => {
        if (response.status < 400) {
          this.setState({ssoActive: true });
        } else {
          this.setState({ssoActive: false });
        }
      });
  }

  componentWillMount() {
    checkUser(this.okapiUrl, this.store, this.tenant);
  }

  handleSubmit(data) {
    requestLogin(this.okapiUrl, this.store, this.tenant, data).then((response) => {
      if (response.status >= 400) {
        // eslint-disable-next-line no-param-reassign
        this.initialValues.username = data.username;
      }
    });
  }

  handleSSOLogin(e) {
    window.open(`${this.okapiUrl}/_/invoke/tenant/${this.tenant}/saml/login`, '_self');
  }

  render() {
    const authFail = this.props.authFail;

    return (
      <div className={css.loginOverlay}>
        <Login
          onSubmit={this.handleSubmit}
          authFail={authFail}
          initialValues={this.initialValues}
        />
        { this.state.ssoActive ?      
          <SSOLogin
            handleSSOLogin={this.handleSSOLogin} /> : null
        }
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { authFail: state.okapi.authFailure };
}

export default reduxConnect(mapStateToProps)(LoginCtrl);
