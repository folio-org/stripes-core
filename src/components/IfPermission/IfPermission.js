import React from 'react';
import PropTypes from 'prop-types';
import { StripesContext } from '../../StripesContext';

const IfPermission = ({ children, perm }) => (
  <StripesContext.Consumer>
    {stripes => {
      const hasPermission = stripes.hasPerm(perm);

      if (typeof children === 'function') {
        return children({ hasPermission });
      }

      return hasPermission ? children : null;
    }}
  </StripesContext.Consumer>
);

IfPermission.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  perm: PropTypes.string.isRequired
};

export default IfPermission;
