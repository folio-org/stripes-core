import React from 'react';

export const StripesContext = React.createContext();

export function withStripes(WrappedComponent) {
  return class extends React.Component {
    render(props) {
      return (
        <StripesContext.Consumer>
          {stripes => <WrappedComponent {...props} stripes={stripes} /> }
        </StripesContext.Consumer>
      );
    }
  };
}
