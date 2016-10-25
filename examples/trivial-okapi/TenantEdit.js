import React, { Component } from 'react';
import { connect } from 'stripes-connect';

class TenantEdit extends Component {
  static manifest = {
    'tenants': {
      type: 'okapi',
      path: '_proxy/tenants/:tenantid'
    }
  };

  render() { 
    return <div>Tenant Edit ID: {this.props.params.id}</div>
  }
}

export default connect(TenantEdit, 'trivial-okapi');
