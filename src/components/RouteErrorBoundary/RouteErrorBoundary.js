/**
 * RouteErrorBoundary
 */

import React from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

const RouteErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

RouteErrorBoundary.propTypes = {
  children: PropTypes.node,
};

export default RouteErrorBoundary;
