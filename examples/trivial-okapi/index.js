import React from 'react';
import Match from 'react-router/Match';
import Miss from 'react-router/Miss';
import TenantList from './TenantList';
import TenantEdit from './TenantEdit';

export default ({pathname}) => <div>
  <h3>Trivially commmunicating with Okapi</h3>
  <Match exactly pattern={pathname} component={TenantList}/>
  <Match pattern={`${pathname}/edit/:id`} component={TenantEdit}/> 
</div>;
