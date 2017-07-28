import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Link from 'react-router-dom/Link';
import queryString from 'query-string';

const SSOLanding = (props) => {
  const search = props.location.search;
  if (!search) {
    return <div>No search string</div>;
  }
  const query = queryString.parse(search);
  const token = query['ssoToken'];
  if (!token) {
    return <div>No <tt>ssoToken</tt> query parameter</div>;
  }

  props.stripes.setToken(token);
  return (
    <div>
      <p>Logged in with: token <tt>{token}</tt></p>
      <p><Link to="/">continue</Link></p>
    </div>
  );
};

SSOLanding.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  stripes: PropTypes.shape({
    setToken: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(SSOLanding);
