import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { withCookies, Cookies } from 'react-cookie';
import queryString from 'query-string';
import { findUserById } from '../loginServices';

function getParams(props) {
  const search = props.location.search;
  if (!search) return undefined;
  return queryString.parse(search) || {};
}

class SSOLanding extends Component {

  constructor(props, context) {
    super(props, context);

    this.store = context.store;
    this.sys = require('stripes-loader'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
  }

  render() {
    const cookies = this.props.cookies;
    const params = getParams(this.props);

    const token = cookies.get('ssoToken') || params.ssoToken;
    const userId = cookies.get('userId') || params.userId;

    if (!token) {
      return <div>No <tt>ssoToken</tt> cookie or query parameter</div>;
    } else if (!userId) {
      return <div>No <tt>UserId</tt> cookie or query parameter</div>;
    }

    findUserById(this.okapiUrl, this.store, this.tenant, token, userId);

    return (
      <div>
        <p>Logged in with token <tt>{token}</tt> from {params.ssoToken ? 'param' : 'cookie'}</p>
        <p>Logged in with user id <tt>{userId}</tt> from {params.userId ? 'param' : 'cookie'}</p>
      </div>
    );
  }
}

SSOLanding.contextTypes = {
  store: PropTypes.object,
};

SSOLanding.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

export default withCookies(withRouter(SSOLanding));
