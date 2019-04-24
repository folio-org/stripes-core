import React, { Component } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { withStripes } from './StripesContext';
import { stripesShape } from './Stripes';

export default function stripesConnect(WrappedComponent, options) {
  class ConnectedComponent extends Component {
    static propTypes = {
      stripes: stripesShape.isRequired
    }

    constructor(props) {
      super(props);
      this.connectedComponent = props.stripes.connect(WrappedComponent, options);
    }

    render() {
      return <this.connectedComponent {...this.props} />;
    }
  }

  return withStripes(hoistNonReactStatics(ConnectedComponent, WrappedComponent));
}
