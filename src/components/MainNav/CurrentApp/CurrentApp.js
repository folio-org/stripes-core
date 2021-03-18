/**
 * Current App
 */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import CurrentAppButton from './CurrentAppButton';
import homeIcon from '../../../assets/icons/icon-home.svg';

const propTypes = {
  config: PropTypes.shape({
    platformName: PropTypes.string,
    platformDescription: PropTypes.string,
  }),
  currentApp: PropTypes.shape(
    {
      displayName: PropTypes.string,
      home: PropTypes.string,
      iconData: PropTypes.object, // Only used by "Settings" since it's not a standalone app yet
      name: PropTypes.string,
      route: PropTypes.string,
    },
  ),
  id: PropTypes.string,
  intl: PropTypes.object,
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const CurrentApp = ({ config, currentApp, id, intl, badge }) => {
  const actualCurrentApp = currentApp || {
    displayName: config.platformName || 'FOLIO',
    description: config.platformDescription || 'FOLIO platform',
    iconData: {
      src: homeIcon,
      alt: 'FOLIO',
    },
  };

  const { displayName, iconData, module, home, route } = actualCurrentApp;
  const href = home || route;
  const ariaLabel = href ? intl.formatMessage({ id: 'stripes-core.mainnav.currentAppAriaLabel' }, { appName: displayName }) : displayName;

  return (
    <CurrentAppButton
      data-test-current-app-home-button
      ariaLabel={ariaLabel}
      badge={badge}
      iconData={iconData}
      iconKey={module}
      id={id}
      label={displayName}
      to={href}
    />
  );
};

CurrentApp.propTypes = propTypes;

export default injectIntl(CurrentApp);
