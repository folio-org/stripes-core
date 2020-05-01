import React, { useContext } from 'react';
import { Route, useLocation } from 'react-router-dom';
import { connectFor } from '@folio/stripes-connect';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';
import ModulesContext from './ModulesContext';
import { StripesContext } from './StripesContext';
import AddContext from './AddContext';
import TitleManager from './components/TitleManager';
import { getHandlerComponents } from './handlerService';
import events from './events';
import { isQueryResourceModule } from './locationService';

function getModuleRoutes(stripes) {
  return (
    <ModulesContext.Consumer>
      {(modules) => {
        if (!Array.isArray(modules.app) && modules.length < 1) {
          throw new Error('At least one module of type "app" must be enabled.');
        }

        return modules.app.map((module) => {
          const name = module.module.replace(/^@folio\//, '');
          const displayName = module.displayName;
          const perm = `module.${name}.enabled`;
          if (!stripes.hasPerm(perm)) return null;

          const connect = connectFor(module.module, stripes.epics, stripes.logger);
          const Current = connect(module.getModule());
          const moduleStripes = stripes.clone({ connect });

          return (
            <Route
              path={module.route}
              key={module.route}
              render={props => {
                const data = { displayName, name };
                const components = getHandlerComponents(events.SELECT_MODULE, moduleStripes, modules.handler, data);
                if (components.length) {
                  return components.map(HandlerComponent => (<HandlerComponent stripes={stripes} data={data} />));
                }

                return (
                  <StripesContext.Provider value={moduleStripes}>
                    <AddContext context={{ stripes: moduleStripes }}>
                      <div id={`${name}-module-display`} data-module={module.module} data-version={module.version}>
                        <ErrorBoundary>
                          <TitleManager page={displayName}>
                            <Current {...props} connect={connect} stripes={moduleStripes} actAs="app" />
                          </TitleManager>
                        </ErrorBoundary>
                      </div>
                    </AddContext>
                  </StripesContext.Provider>);
              }}
            />
          );
        }).filter(x => x);
      }}
    </ModulesContext.Consumer>
  );
}

export default getModuleRoutes;

export const useModules = () => useContext(ModulesContext);

export const useCurrentApp = () => {
  const modules = useModules();
  const location = useLocation();

  const { app, settings } = modules;
  return app.concat(settings).find(m => isQueryResourceModule(m, location));
};
