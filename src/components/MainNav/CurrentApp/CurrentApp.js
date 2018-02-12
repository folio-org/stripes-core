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
  icon: PropTypes.oneOfType([
    PropTypes.element,
  ]),
  badge: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

const defaultProps = {
  currentApp: { displayName: 'FOLIO', description: 'FOLIO platform' },
};

const CurrentApp = ({ currentApp, icon, badge, id }) => {
  const displayIcon = (<div className={css.icon}>{icon || <AppIcon focusable={false} />}</div>);

  return (
    <div id={id} title={currentApp.description} className={css.currentApp}>
      {badge && (<Badge color="red" className={css.badge}>{badge}</Badge>)}
      {displayIcon}
      <Headline tag="h1" size="small" style={{ margin: 0 }} >{currentApp.displayName}</Headline>
    </div>
  );
};

CurrentApp.propTypes = propTypes;
CurrentApp.defaultProps = defaultProps;

export default CurrentApp;
