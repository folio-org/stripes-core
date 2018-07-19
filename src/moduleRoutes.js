import React from 'react';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';
import ModulesContext from './ModulesContext';
import { StripesContext } from './StripesContext';
import TitleManager from './components/TitleManager';

function getModuleRoutes(stripes, addReducer, store) {
  return (
    <ModulesContext.Consumer>
      {(modules) => {
        if (!Array.isArray(modules.app) && modules.length < 1) {
          throw new Error('At least one module of type "app" must be enabled.');
        }

        return modules.app.map((module) => {
          const name = module.module.replace(/^@folio\//, '');
          const perm = `module.${name}.enabled`;
          if (!stripes.hasPerm(perm)) return null;

          const connect = connectFor(module.module, stripes.epics, stripes.logger, addReducer, store);
          const Current = connect(module.getModule());
          const moduleStripes = stripes.clone({ connect });

          return (
            <Route
              path={module.route}
              key={module.route}
              render={props => (
                <StripesContext.Provider value={moduleStripes}>
                  <div id={`${name}-module-display`} data-module={module.module} data-version={module.version} >
                    <ErrorBoundary>
                      <TitleManager page={module.displayName}>
                        <Current {...props} connect={connect} stripes={moduleStripes} />
                      </TitleManager>
                    </ErrorBoundary>
                  </div>
                </StripesContext.Provider>
              )}
            />
          );
        }).filter(x => x);
      }}
    </ModulesContext.Consumer>
  );
}

export default getModuleRoutes;
