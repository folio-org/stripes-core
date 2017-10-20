import React from 'react';
import PropTypes from 'prop-types';
import Match from 'react-router/Match';
import TenantList from './TenantList';
import TenantEdit from './TenantEdit';

export default function Trivial({ pathname, connect }) {
  return (
    <div>
      <h3>Trivially communicating with Okapi</h3>
      <Match exactly pattern={pathname} component={connect(TenantList)} />
      <Match pattern={`${pathname}/edit/:id`} component={TenantEdit} />
    </div>
  );
}

Trivial.propTypes = {
  pathname: PropTypes.string.isRequired,
  connect: PropTypes.func.isRequired,
};
