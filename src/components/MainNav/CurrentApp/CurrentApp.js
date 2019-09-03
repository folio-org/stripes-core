/**
 * Current App
 */

import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Headline from '@folio/stripes-components/lib/Headline';
import NavButton from '../NavButton';
import css from './CurrentApp.css';

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
  intl: intlShape,
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const CurrentApp = ({ config, currentApp, id, intl, badge }) => {
  const actualCurrentApp = currentApp || {
    displayName: config.platformName || 'FOLIO',
    description: config.platformDescription || 'FOLIO platform',
  };

  const { displayName, iconData, name, home, route } = actualCurrentApp;
  const href = home || route;
  const ariaLabel = href ? intl.formatMessage({ id: 'stripes-core.mainnav.currentAppAriaLabel' }, { appName: displayName }) : displayName;

  return (
    <NavButton
      label={
        <Headline
          tag="h1"
          margin="none"
          weight="black"
          className={css.button__label__inner}
        >
          {displayName}
        </Headline>
      }
      id={id}
      ariaLabel={ariaLabel}
      badge={badge}
      iconKey={name}
      className={css.button}
      innerClassName={css.button__inner}
      labelClassName={css.button__label}
      href={href}
      iconData={iconData}
    />
  );
};

CurrentApp.propTypes = propTypes;

export default injectIntl(CurrentApp);
