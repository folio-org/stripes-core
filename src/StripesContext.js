import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const StripesContext = React.createContext();

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export const useStripes = () => useContext(StripesContext);

export function withStripes(WrappedComponent) {
  class WithStripes extends React.Component {
    static propTypes = {
      stripes: PropTypes.object,
    }

    render() {
      return (
        <StripesContext.Consumer>
          {stripes => <WrappedComponent {...this.props} stripes={this.props.stripes || stripes} /> }
        </StripesContext.Consumer>
      );
    }
  }
  WithStripes.displayName = `WithStripes(${getDisplayName(WrappedComponent)})`;

  return hoistNonReactStatics(WithStripes, WrappedComponent);
}
