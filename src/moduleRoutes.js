import React from 'react';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import { modules } from 'stripes-loader'; // eslint-disable-line
import AddContext from './AddContext';

if (!Array.isArray(modules.app) && modules.length < 0) {
  throw new Error('At least one module of type "app" must be enabled.');
}

function getModuleRoutes(stripes) {
  return modules.app.map((module) => {
    const name = module.module.replace(/^@folio\//, '');
    const perm = `module.${name}.enabled`;
    if (!stripes.hasPerm(perm)) return null;

    const connect = connectFor(module.module, stripes.logger);
    const Current = connect(module.getModule());
    const moduleStripes = Object.assign({}, stripes, { connect });

    return (
      <Route
        path={module.route}
        key={module.route}
        render={props =>
          <AddContext context={{ stripes: moduleStripes }}>
            <Current {...props} connect={connect} stripes={moduleStripes} />
          </AddContext>
        }
      />
    );
  }).filter(x => x);
}

export default getModuleRoutes;
