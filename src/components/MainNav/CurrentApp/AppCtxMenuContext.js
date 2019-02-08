import React from 'react';

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
  return WrappedComponent;
}
