import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { withCookies, Cookies } from 'react-cookie';
import queryString from 'query-string';
import { requestUserWithPerms } from '../loginServices';

const requestUserWithPermsDeb = _.debounce(requestUserWithPerms, 5000, { leading: true, trailing: false });

class SSOLanding extends Component {
  constructor(props, context) {
    super(props, context);

    this.store = context.store;
    this.sys = require('stripes-config'); // eslint-disable-line
    this.okapiUrl = this.sys.okapi.url;
    this.tenant = this.sys.okapi.tenant;
  }

  componentWillMount() {
    const token = this.getToken();

    if (token) {
      requestUserWithPermsDeb(this.okapiUrl, this.store, this.tenant, token);
    }
  }

  getParams() {
    const search = this.props.location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  }

  getToken() {
    const params = this.getParams();
    const cookies = this.props.cookies;
    return cookies.get('ssoToken') || params.ssoToken;
  }

  render() {
    const params = this.getParams();
    const token = this.getToken();

    if (!token) {
      return <div>No <tt>ssoToken</tt> cookie or query parameter</div>;
    }

    return (
      <div>
        <p>Logged in with token <tt>{token}</tt> from {params.ssoToken ? 'param' : 'cookie'}</p>
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
