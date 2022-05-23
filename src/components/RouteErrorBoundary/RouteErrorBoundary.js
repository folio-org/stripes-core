/**
 * RouteErrorBoundary
 */

import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { ErrorBoundary } from '@folio/stripes-components';
import events from '../../events';
import { getEventHandlers } from '../../handlerService';
import { ModulesContext } from '../../ModulesContext';
import { StripesContext } from '../../StripesContext';

const RouteErrorBoundary = ({ children, escapeRoute, moduleName, isSettings }) => {
  const intl = useIntl();
  let buttonLabelId;

  const modules = useContext(ModulesContext);
  const stripes = useContext(StripesContext);

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
    window.location.replace(escapeRoute);
  };

  /**
   * handleError
   * Callback from ErrorBoundary's componentDidCatch method. Pass along
   * the values received there to any functions that are registered to
   * listen to events.ERROR.
   */
  const handleError = (error, info) => {
    const handlers = getEventHandlers(events.ERROR, stripes, modules.handler, {});
    handlers.forEach(handleEvent => {
      handleEvent(error, info);
    });
  };

  return (
    <ErrorBoundary
      subTitle={intl.formatMessage({ id: 'stripes-core.routeErrorBoundary.sub' })}
      resetButtonLabel={intl.formatMessage({ id: buttonLabelId }, { name: moduleName })}
      onReset={handleReset}
      onError={handleError}
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
