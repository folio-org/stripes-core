import React from 'react';
import PropTypes from 'prop-types';
import { StripesContext } from '../../StripesContext';

const IfInterface = ({ children, name, version }) => (
  <StripesContext.Consumer>
    {stripes => (
      stripes.hasInterface(name, version) ? children : null
    )}
  </StripesContext.Consumer>
);

IfInterface.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
  version: PropTypes.string,
};

export default IfInterface;
