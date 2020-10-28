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
  const shouldGoToAppHome = currentRoute === escapeRoute;
  let buttonLabel = intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.goToAppHomeLabel' });

  if (moduleName) {
    buttonLabel = intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.goToModuleHomeLabel' }, { name: moduleName });

    if (isSettings) {
      buttonLabel = intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.goToModuleSettingsHomeLabel' }, { name: moduleName });
    }
  }

  const handleReset = () => {
    // Go to the FOLIO app home page if the escape path is the same as the current path
    const path = shouldGoToAppHome ? '/' : escapeRoute;
    window.location.replace(path);
  };

  return (
    <ErrorBoundary
      forceProductionError
      subTitle={intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.sub' })}
      resetButtonLabel={buttonLabel}
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
