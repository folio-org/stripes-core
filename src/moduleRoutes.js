import React, { Suspense } from 'react';
import { useLocation } from 'react-router';
import PropTypes from 'prop-types';

import { LoadingView } from '@folio/stripes-components';

import { ModulesContext } from './ModulesContext';

import { packageName } from './constants';
import {
  BadRequestScreen,
  NoPermissionScreen,
  ResetPasswordNotAvailableScreen,
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

        const currentModule = modules.app.find(module => location.pathname.startsWith(`${module.route}`));
        const moduleName = currentModule?.module?.replace(packageName.PACKAGE_SCOPE_REGEX, '');

        if (!stripes.hasPerm(`module.${moduleName}.enabled`)) {
          return (
            <TitledRoute
              name="noPermission"
              component={<NoPermissionScreen />}
            />
          );
        }

        return (
          <Suspense fallback={<LoadingView />}>
            <AppRoutes modules={modules} stripes={stripes} />
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
