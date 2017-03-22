import React from 'react';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import { modules } from 'stripes-loader'; // eslint-disable-line

if (!Array.isArray(modules.app) && modules.length < 0) {
  throw new Error('At least one module of type "app" must be enabled.');
}

function getModuleRoutes(stripes) {
  return modules.app.map((module) => {
    const connect = connectFor(module.module, stripes.logger);
    const Current = connect(module.getModule());
    return (
      <Route
        path={module.route}
        key={module.route}
        render={props => <Current {...props} connect={connect} stripes={Object.assign({}, stripes, { connect })} />}
      />
    );
  });
}

export default getModuleRoutes;
