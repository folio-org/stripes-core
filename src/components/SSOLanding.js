import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { withCookies, Cookies } from 'react-cookie';
import queryString from 'query-string';
import Link from 'react-router-dom/Link';

function getCookie(props) {
  const cookies = props.cookies;
  const cookie = cookies.get('ssoToken');
  return cookie;
}

function getParam(props) {
  const search = props.location.search;
  if (!search) return undefined;
  const query = queryString.parse(search);
  return query.ssoToken;
}

const SSOLanding = (props) => {
  const cookie = getCookie(props);
  const param = getParam(props);

  if (!cookie && !param) {
    return <div>No <tt>ssoToken</tt> cookie or query parameter</div>;
  } else if (cookie && param) {
    return <div>Both <tt>ssoToken</tt> cookie and query parameters provided</div>;
  }

  props.stripes.setToken(cookie || param);
  return (
    <div>
      <p>Logged in with token <tt>{cookie || param}</tt> from {cookie ? 'cookie' : 'param'}</p>
      <p><Link to="/">continue</Link></p>
    </div>
  );
};

SSOLanding.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  stripes: PropTypes.shape({
    setToken: PropTypes.func.isRequired,
  }).isRequired,
};

export default withCookies(withRouter(SSOLanding));
