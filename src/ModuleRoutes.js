import { useLocation } from 'react-router';
import PropTypes from 'prop-types';

import { ModulesContext } from './ModulesContext';

import { packageName } from './constants';
import {
  AuthenticatedError,
  NoPermissionScreen,
  TitledRoute,
} from './components';

import AppRoutes from './AppRoutes';

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

        // requested route does not belong to any module
        if (!modules.app.some(module => location.pathname.startsWith(`${module.route}`))) {
          return <AuthenticatedError location={location} />;
        }

        const currentModule = modules.app.find(module => {
          const SEPARATOR = '/';

          return `${SEPARATOR}${location.pathname.split(SEPARATOR)[1]}` === module.route;
        });
        const moduleName = currentModule?.module?.replace(packageName.PACKAGE_SCOPE_REGEX, '');

        // requested route is forbidden
        if (!stripes.hasPerm(`module.${moduleName}.enabled`)) {
          return (
            <TitledRoute
              name="noPermission"
              component={<NoPermissionScreen />}
            />
          );
        }

        return (
          <AppRoutes modules={modules} stripes={stripes} />
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
