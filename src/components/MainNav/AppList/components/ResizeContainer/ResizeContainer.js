/**
 * AppList -> ResizeContainer
 */

import React from 'react';
import css from './ResizeContainer.css';

const ResizeContainer = ({ children, items }) => {
  const renderProps = {
    visibleItems: items,
    hiddenItems: items,
  };

  return (
    <div className={css.resizeContainerWrapper}>
      <div className={css.resizeContainerInner}>
        {children(renderProps)}
      </div>
    </div>
  );
};

export default ResizeContainer;
