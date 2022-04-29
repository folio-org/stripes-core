import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { connectFor } from '@folio/stripes-connect';
import { LoadingView } from '@folio/stripes-components';

import { ModulesContext } from './ModulesContext';
import { StripesContext } from './StripesContext';
import AddContext from './AddContext';
import TitleManager from './components/TitleManager';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { getEventHandlers } from './handlerService';
import { packageName } from './constants';
import {
  BadRequestScreen,
  ModuleHierarchyProvider,
  ResetPasswordNotAvailableScreen,
  TitledRoute,
} from './components';
import events from './events';

const propTypes = {
  stripes: PropTypes.shape({
    clone: PropTypes.func.isRequired,
    epics: PropTypes.object,
    hasPerm: PropTypes.func.isRequired,
    logger: PropTypes.object.isRequired,
  }).isRequired,
};

function ModuleRoutes({ stripes }) {
  const location = useLocation();

  return (
    <ModulesContext.Consumer>
      {(modules) => {
        if (!Array.isArray(modules.app) && modules.length < 1) {
          throw new Error('At least one module of type "app" must be enabled.');
        }

        const isValidRoute = modules.app.some(module => location.pathname.startsWith(`${module.route}`));

        if (!isValidRoute) {
          const isResetPasswordRoute = location.pathname.startsWith('/reset-password');

          return isResetPasswordRoute
            ? (
              <TitledRoute
                name="notFound"
                component={<ResetPasswordNotAvailableScreen />}
              />
            )
            : (
              <TitledRoute
                name="notFound"
                component={<BadRequestScreen />}
              />
            );
        }

        return (
          <Suspense fallback={<LoadingView />}>
            {modules.app.map((module) => {
              const name = module.module.replace(packageName.PACKAGE_SCOPE_REGEX, '');
              const displayName = module.displayName;
              const perm = `module.${name}.enabled`;
              if (!stripes.hasPerm(perm)) {
                return (
                  <FormattedMessage
                    id="stripes-core.front.error.noPermission"
                    tagName="h2"
                  />
                );
              }

              const connect = connectFor(module.module, stripes.epics, stripes.logger);

              let Current;
              try {
                Current = connect(module.getModule());
              } catch (error) {
                console.error(error); // eslint-disable-line
                throw Error(error);
              }

              const moduleStripes = stripes.clone({ connect });

              return (
                <Route
                  path={module.route}
                  key={module.route}
                  render={props => {
                    const data = { displayName, name };

                    // allow SELECT_MODULE handlers to intervene
                    const components = getEventHandlers(events.SELECT_MODULE, moduleStripes, modules.handler, data);
                    if (components.length) {
                      return components.map(HandlerComponent => (<HandlerComponent stripes={stripes} data={data} />));
                    }

                    return (
                      <StripesContext.Provider value={moduleStripes}>
                        <AddContext context={{ stripes: moduleStripes }}>
                          <ModuleHierarchyProvider module={module.module}>
                            <div id={`${name}-module-display`} data-module={module.module} data-version={module.version}>
                              <RouteErrorBoundary
                                escapeRoute={module.home}
                                moduleName={displayName}
                                stripes={moduleStripes}
                              >
                                <TitleManager page={displayName}>
                                  <Current {...props} connect={connect} stripes={moduleStripes} actAs="app" />
                                </TitleManager>
                              </RouteErrorBoundary>
                            </div>
                          </ModuleHierarchyProvider>
                        </AddContext>
                      </StripesContext.Provider>
                    );
                  }}
                />
              );
            }).filter(x => x)}
          </Suspense>
        );
      }}
    </ModulesContext.Consumer>
  );
}

ModuleRoutes.propTypes = propTypes;

export default ModuleRoutes;

// this might be handy at some point:
//
// import React, { useContext, useMemo } from 'react';
// import { Route, useLocation } from 'react-router-dom';
// import { isQueryResourceModule } from './locationService';
//
// export const useModules = () => useContext(ModulesContext);
//
// export const useCurrentApp = () => {
//   const modules = useModules();
//   const location = useLocation();
//
//   const memoizedApp = useMemo(() => {
//     const { app, settings } = modules;
//     return app.concat(settings).find(m => isQueryResourceModule(m, location));
//   }, [location, modules]);
//
//   return memoizedApp;
// };
