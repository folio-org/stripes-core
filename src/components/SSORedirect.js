import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Redirect } from 'react-router';
import queryString from 'query-string';

class SSORedirect extends Component {
  getParams() {
    const search = this.props.location.search;
    if (!search) return undefined;
    return queryString.parse(search) || {};
  }

  getUrl() {
    const params = this.getParams();
    return params.fwd;
  }

  render() {
    const forwardUrl = this.getUrl();
    return (
      <Redirect to={forwardUrl} />
    );
  }
}

SSORedirect.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default withRouter(SSORedirect);
