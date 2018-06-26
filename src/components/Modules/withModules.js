import React from 'react';
import ModulesContext from './../../ModulesContext';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function withModules(WrappedComponent) {
  class WithModules extends React.Component {
    render() {
      return (
        <ModulesContext.Consumer>
          {modules => <WrappedComponent {...this.props} modules={modules} /> }
        </ModulesContext.Consumer>
      );
    }
  }
  WithModules.displayName = `WithModules(${getDisplayName(WrappedComponent)})`;
  return WithModules;
}
