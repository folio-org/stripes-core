import React, { Component } from 'react';
import { Link } from 'react-router';

class TenantList extends Component {
  static handler(e) {
    console.log("TenantList ERROR: in module '" + e.module + "', " +
                " operation '" + e.op + "' on " +
                " resource '" + e.resource + "' failed, saying: " + e.error);
  }

  static manifest = {
    '@errorHandler': TenantList.handler,
    'tenants': {
      path: '_/proxy/tenants',
      type: 'okapi'
    }
  };

  render() {
    const { data, mutator, pathname } = this.props;
    if (!data.tenants) return null;
    var tenantNodes = data.tenants.map((tenant) => {
      return (
        <li key={tenant.id}>
          {tenant.name} [<a onClick={() => mutator.tenants.DELETE(tenant)}>delete</a>]
          [<Link to={`${pathname}/edit/${tenant.id}`}>Edit</Link>] 
        </li>
      );
    });
    return (
      <div>
        <h3>Tenant list:</h3>
        <ul>
          {tenantNodes}
        </ul>
      </div>
    );
  }
}
export default TenantList;
