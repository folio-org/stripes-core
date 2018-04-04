import React from 'react';
import PropTypes from 'prop-types';
import css from './OverlayContainer.css';

function OverlayContainer(props) {
  return (
    <div id="OverlayContainer" className={css.overlayContainer} />
  );
}

export default OverlayContainer;