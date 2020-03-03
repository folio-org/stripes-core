import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withStripes } from '../../../src/StripesContext';

export default function connectStripes(component) {
  const propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func
    })
  };

  class Connected extends Component {
    constructor(props) {
      super(props);
      this.connected = props.stripes.connect(component);
    }

    render() {
      return <this.connected {...this.props} />;
    }
  }

  Connected.propTypes = propTypes;

  return withStripes(Connected);
}
