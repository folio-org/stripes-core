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

  return (
    <div id={id} title={description} className={css.currentApp}>
      {badge && (<Badge color="red" className={css.badge}>{badge}</Badge>)}
      <AppIcon icon={iconData} app={iconKey} className={css.icon} />
      <Headline tag="h1" size="small" margin="none">{displayName}</Headline>
    </div>
  );
};

CurrentApp.propTypes = propTypes;
CurrentApp.defaultProps = defaultProps;

export default CurrentApp;
