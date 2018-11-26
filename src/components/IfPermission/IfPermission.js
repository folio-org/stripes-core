import React from 'react';
import PropTypes from 'prop-types';
import { StripesContext } from '../../StripesContext';

const IfPermission = ({ children, perm }) => (
  <StripesContext.Consumer>
    {stripes => (
      stripes.hasPerm(perm) ? children : null
    )}
  </StripesContext.Consumer>
);

IfPermission.propTypes = {
  children: PropTypes.node,
  perm: PropTypes.string.isRequired
};

export default IfPermission;
