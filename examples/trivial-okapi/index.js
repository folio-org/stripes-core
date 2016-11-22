import React from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import TenantList from './TenantList';
import TenantEdit from './TenantEdit';

export default ({pathname, connect}) => <div>
  <h3>Trivially communicating with Okapi</h3>
  <Match exactly pattern={pathname} component={connect(TenantList)}/>
  <Match pattern={`${pathname}/edit/:id`} component={TenantEdit}/> 
</div>;
