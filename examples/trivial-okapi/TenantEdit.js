import React, { Component } from 'react';

class TenantEdit extends Component {
  render() { 
    return <div>Tenant Edit ID: {this.props.params.id}</div>
  }
}

TenantEdit.manifest = {
  'tenants': {
    type: 'okapi',
    path: '_proxy/tenants/:tenantid'
  }
};

export default TenantEdit;
