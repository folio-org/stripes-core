/**
 * Current App
 */

import React from 'react';
import PropTypes from 'prop-types';
import NavButton from '../NavButton';

const propTypes = {
  currentApp: PropTypes.object,
};

const CurrentApp = ({ currentApp }) => {
  const { displayName, description } = currentApp;
  const iconKey = currentApp.module.replace(/^@[a-z0-9_]+\//, '');
  return (
    <NavButton
      label={displayName}
      title={description}
      iconKey={iconKey}
    />
  );
};

CurrentApp.propTypes = propTypes;

export default CurrentApp;
