import React, { useMemo } from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import { connectFor } from '@folio/stripes-connect';

import { StripesContext } from './StripesContext';
import AddContext from './AddContext';
import TitleManager from './components/TitleManager';
import RouteErrorBoundary from './components/RouteErrorBoundary';
import { getEventHandlers } from './handlerService';
import { packageName } from './constants';
import { ModuleHierarchyProvider } from './components';
import events from './events';

// Process and cache "app" type modules and render the routes
const AppRoutes = ({ modules, stripes }) => {
  // cache app modules
  const cachedModules = useMemo(() => {
    return modules.app.map(module => {
      const name = module.module.replace(packageName.PACKAGE_SCOPE_REGEX, '');
      const displayName = module.displayName;
      const perm = `module.${name}.enabled`;
      if (!stripes.hasPerm(perm)) return null;

      const connect = connectFor(module.module, stripes.epics, stripes.logger);

      let ModuleComponent;
      try {
        ModuleComponent = connect(module.getModule());
      } catch (error) {
        console.error(error); // eslint-disable-line
        throw Error(error);
      }

      const moduleStripes = stripes.clone({ connect });

      return {
        ModuleComponent,
        moduleStripes,
        displayName,
        name,
        module,
        stripes,
        connect,
      };
    }).filter(x => x);
  }, [modules.app]);

  return cachedModules.map(({ ModuleComponent, connect, module, name, moduleStripes, stripes, displayName }) => (
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
                    escapeRoute={module.home ?? module.route}
                    moduleName={displayName}
                    stripes={moduleStripes}
                  >
                    <TitleManager page={displayName}>
                      <ModuleComponent {...props} connect={connect} stripes={moduleStripes} actAs="app" />
                    </TitleManager>
                  </RouteErrorBoundary>
                </div>
              </ModuleHierarchyProvider>
            </AddContext>
          </StripesContext.Provider>
        );
      }}
    />
  ));
};

AppRoutes.propTypes = {
  modules: PropTypes.object,
  stripes: PropTypes.shape({
    clone: PropTypes.func.isRequired,
    epics: PropTypes.object,
    hasPerm: PropTypes.func.isRequired,
    logger: PropTypes.object.isRequired,
  }).isRequired,
};

export default AppRoutes;
