import React from 'react';

const Context = React.createContext();

export const StripesProvider = Context.Provider;
export const StripesConsumer = Context.Consumer;

export function withStripes(WrappedComponent) {
  return class extends React.Component {
    render(props) {
      return (
        <StripesConsumer>
          {stripes => <WrappedComponent {...props} stripes={stripes} /> }
        </StripesConsumer>
      );
    }
  };
}
