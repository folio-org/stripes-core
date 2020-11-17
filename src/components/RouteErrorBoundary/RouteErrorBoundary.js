/**
 * RouteErrorBoundary
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import ErrorBoundary from '@folio/stripes-components/lib/ErrorBoundary';

const RouteErrorBoundary = ({ children, escapeRoute, moduleName, isSettings }) => {
  const intl = useIntl();
  const history = useHistory();
  const currentRoute = history.location.pathname;
  let buttonLabelId;

  if (moduleName) {
    if (isSettings) {
      buttonLabelId = 'stripes-core.routeErrorBoundary.goToModuleSettingsHomeLabel';
    } else {
      buttonLabelId = 'stripes-core.routeErrorBoundary.goToModuleHomeLabel';
    }
  } else {
    buttonLabelId = 'stripes-core.routeErrorBoundary.goToAppHomeLabel';
  }

  const handleReset = () => {
    // If our escape-route is the thing that's bombing, go home
    // otherwise, try the escape-route
    const resetPath = currentRoute === escapeRoute ? '/' : escapeRoute;
    window.location.replace(resetPath);
  };

  return (
    <ErrorBoundary
      subTitle={intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.sub' })}
      resetButtonLabel={intl.formatMessage({ id: buttonLabelId }, { name: moduleName })}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};

RouteErrorBoundary.propTypes = {
  children: PropTypes.node,
  escapeRoute: PropTypes.string,
  moduleName: PropTypes.node,
  isSettings: PropTypes.bool,
};

RouteErrorBoundary.defaultProps = {
  escapeRoute: '/'
};

export default RouteErrorBoundary;
