import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { AppCtxMenuContext } from '@folio/stripes-shared-context';

export { AppCtxMenuContext };

export function withAppCtxMenu(Component) {
  const WrappedComponent = (props) => {
    return (
      <AppCtxMenuContext.Consumer>
        {(menuProps) => (
          <Component {...props} {...menuProps} />
        )}
      </AppCtxMenuContext.Consumer>
    );
  };
  return hoistNonReactStatics(WrappedComponent, Component);
}
