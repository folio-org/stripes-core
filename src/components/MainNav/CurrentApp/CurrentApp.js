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

const defaultProps = {
  currentApp: { displayName: 'FOLIO', description: 'FOLIO platform' },
};

const CurrentApp = ({ currentApp, id, intl, badge }) => {
  const { displayName, iconData, name, home, route } = currentApp;
  const href = home || route;
  const ariaLabel = href ? intl.formatMessage({ id: 'stripes-core.mainnav.currentAppAriaLabel' }, { appName: displayName }) : displayName;

  return (
    <NavButton
      label={
        <Headline
          tag="h1"
          size="x-large"
          margin="none"
          className={css.button__label}
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
      href={href}
      iconData={iconData}
    />
  );
};

CurrentApp.propTypes = propTypes;
CurrentApp.defaultProps = defaultProps;

export default injectIntl(CurrentApp);
