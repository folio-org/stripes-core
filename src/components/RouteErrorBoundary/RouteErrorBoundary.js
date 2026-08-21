/**
 * RouteErrorBoundary
 */

import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { ErrorBoundary } from '@folio/stripes-components';
import events from '../../events';
import { invokeEventHandlers } from '../../handlerService';
import { ModulesContext } from '../../ModulesContext';
import { StripesContext } from '../../StripesContext';

const RouteErrorBoundary = ({ children, escapeRoute = '/', moduleName, isSettings }) => {
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
   *
   * Here, we invoke the handlers but ignore any returned components, allowing
   * the handlers to process side-effects but not to intervene and display an
   * alternative component. Not sure if that's intentional or not. Hmmmmmmm.
   *
   */
  const handleError = (error, info) => {
    invokeEventHandlers(events.ERROR, stripes, modules.handler, { error, info });
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

export default RouteErrorBoundary;
