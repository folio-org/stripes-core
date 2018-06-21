import React from 'react';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';
import { modules } from 'stripes-config'; // eslint-disable-line
import { StripesContext } from './StripesContext';
import AddContext from './AddContext';
import TitleManager from './components/TitleManager';

if (!Array.isArray(modules.app) && modules.length < 0) {
  throw new Error('At least one module of type "app" must be enabled.');
}

function getModuleRoutes(stripes) {
  const { intl } = stripes;

  return modules.app.map((module) => {
    const name = module.module.replace(/^@folio\//, '');
    const perm = `module.${name}.enabled`;
    if (!stripes.hasPerm(perm)) return null;

    const connect = connectFor(module.module, stripes.epics, stripes.logger);
    const Current = connect(module.getModule());
    const moduleStripes = stripes.clone({ connect });

    const displayName = intl.formatMessage({
      id: module.displayName,
      defaultMessage: module.displayName,
    });

    return (
      <Route
        path={module.route}
        key={module.route}
        render={props => (
          <StripesContext.Provider value={moduleStripes}>
            <AddContext context={{ stripes: moduleStripes }}>
              <div id={`${name}-module-display`} data-module={module.module} data-version={module.version} >
                <ErrorBoundary>
                  <TitleManager page={displayName}>
                    <Current {...props} connect={connect} stripes={moduleStripes} />
                  </TitleManager>
                </ErrorBoundary>
              </div>
            </AddContext>
          </StripesContext.Provider>
        )}
      />
    );
  }).filter(x => x);
}

export default getModuleRoutes;
