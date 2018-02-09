import React from 'react';
import PropTypes from 'prop-types';

export default function TenantEdit(props) {
  return (
    <div>Tenant Edit ID: {props.params.id}</div>
  );
}

TenantEdit.manifest = {
  tenants: {
    type: 'okapi',
    path: '_proxy/tenants/:tenantid',
  },
};

TenantEdit.propTypes = {
  params: PropTypes.object,
};
