import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ModulesContext } from '../../ModulesContext';

const getDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

const findModuleInArray = (array, moduleName) => {
  return array.find(m => m.module === moduleName || m.module === `@folio/${moduleName}`);
};

const findModule = (modules, moduleName) => {
  return Object.values(modules)
    .map(mods => findModuleInArray(mods, moduleName))
    .filter(m => m)
    .pop();
};

export default function withModule(moduleName) {
  return (WrappedComponent) => {
    class WithModule extends React.Component {
      render() {
        let name = moduleName;
        if (typeof moduleName === 'function') {
          name = moduleName(this.props);
        }

        return (
          <ModulesContext.Consumer>
            {modules => <WrappedComponent {...this.props} module={findModule(modules, name)} /> }
          </ModulesContext.Consumer>
        );
      }
    }
    WithModule.displayName = `WithModule(${getDisplayName(WrappedComponent)})`;
    return hoistNonReactStatics(WithModule, WrappedComponent);
  };
}
