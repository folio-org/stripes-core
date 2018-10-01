/**
 * Current App
 */

import React from 'react';
import PropTypes from 'prop-types';
import Link from 'react-router-dom/Link';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import Badge from '@folio/stripes-components/lib/Badge';
import Headline from '@folio/stripes-components/lib/Headline';
import css from './CurrentApp.css';

const propTypes = {
  currentApp: PropTypes.shape(
    {
      displayName: PropTypes.string,
      description: PropTypes.string,
    },
  ),
  id: PropTypes.string,
  iconData: PropTypes.object,
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const defaultProps = {
  currentApp: { displayName: 'FOLIO', description: 'FOLIO platform' },
};

const CurrentApp = ({ currentApp, iconData, id, badge }) => {
  const { displayName, description, module } = currentApp;
  const iconKey = module && module.replace(/^@[a-z0-9_]+\//, '');
  let Element = 'div';
  let elementProps = {};

  if (currentApp && (currentApp.home || currentApp.route)) {
    Element = Link;
    elementProps = { to: (currentApp.home || currentApp.route) };
  }

  return (
    <Element
      id={id}
      className={css.currentApp}
      title={description}
      {...elementProps}
    >
      {badge && (<Badge color="red" className={css.badge}>{badge}</Badge>)}
      <AppIcon icon={iconData} app={iconKey} className={css.icon} />
      <Headline tag="h1" size="small" margin="none">{displayName}</Headline>
    </Element>
  );
};

CurrentApp.propTypes = propTypes;
CurrentApp.defaultProps = defaultProps;

export default CurrentApp;
