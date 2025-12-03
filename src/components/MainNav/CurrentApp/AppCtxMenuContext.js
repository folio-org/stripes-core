import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const AppCtxMenuContext = React.createContext();

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
