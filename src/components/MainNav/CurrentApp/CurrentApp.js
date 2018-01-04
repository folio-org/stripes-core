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
  return (
    <NavButton
      label={displayName}
      title={description}
    />
  );
};

CurrentApp.propTypes = propTypes;

export default CurrentApp;
