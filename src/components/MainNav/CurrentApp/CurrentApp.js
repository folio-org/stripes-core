/**
 * Current App
 */

import React from 'react';
import PropTypes from 'prop-types';
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
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const defaultProps = {
  currentApp: { displayName: 'FOLIO', description: 'FOLIO platform' },
};

const CurrentApp = ({ currentApp, id, badge }) => {
  const { description, iconData, name, displayName } = currentApp;

  return (
    <div id={id} title={description} className={css.currentApp}>
      {badge && (<Badge color="red" className={css.badge}>{badge}</Badge>)}
      <AppIcon icon={iconData} app={name} className={css.icon} />
      <Headline tag="h1" size="small" margin="none">{displayName}</Headline>
    </div>
  );
};

CurrentApp.propTypes = propTypes;
CurrentApp.defaultProps = defaultProps;

export default CurrentApp;
