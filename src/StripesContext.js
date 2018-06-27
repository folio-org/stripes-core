import React from 'react';

export const StripesContext = React.createContext();

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function withStripes(WrappedComponent) {
  class WithStripes extends React.Component {
    render() {
      return (
        <StripesContext.Consumer>
          {stripes => <WrappedComponent {...this.props} stripes={stripes} /> }
        </StripesContext.Consumer>
      );
    }
  }
  WithStripes.displayName = `WithStripes(${getDisplayName(WrappedComponent)})`;
  return WithStripes;
}
