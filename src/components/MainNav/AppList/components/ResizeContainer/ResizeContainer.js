/**
 * AppList -> ResizeContainer
 */

import React, { useEffect, useState, useRef, createRef } from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import css from './ResizeContainer.css';

const ResizeContainer = ({ className, children, isRTL, hideAllWidth, offset, items: allItems }) => {
  const wrapperRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [items, setItems] = useState(() => allItems.map(item => Object.assign(item, {
    ref: createRef(null),
  })));

  /**
   * Determine visible items on mount and resize
   */
  const determineVisibleItems = callback => {
    const shouldHideAll = window.innerWidth <= hideAllWidth;
    const rtl = isRTL || document.documentElement.dir === 'rtl';
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const { left, right } = wrapperRect;

    const newItems = shouldHideAll ? items.map(item => Object.assign(item, { visible: false })) : items.map(item => {
      const rect = item.ref.current.getBoundingClientRect();
      const visible = rtl ? right >= (rect.right + offset) : (left + offset) <= rect.left;

      return Object.assign(item, {
        visible
      });
    });

    setItems(newItems);

    if (typeof callback === 'function') {
      callback();
    }
  };

  useEffect(() => {
    // On mount
    determineVisibleItems(() => setReady(true));

    // On resize
    window.addEventListener('resize', debounce(determineVisibleItems, 150), true);

    return () => {
      window.removeEventListener('resize', determineVisibleItems, true);
    };
  }, []);

  /**
   * Update hidden items every time the items array updates
   */
  useEffect(() => {
    setHiddenItems(items.filter(item => !item.visible));
  }, [items]);

  return (
    <div
      ref={wrapperRef}
      className={classnames(css.resizeContainerWrapper, { [css.ready]: ready }, className)}
      data-test-resize-container
    >
      <div className={css.resizeContainerInner}>
        {children({
          visibleItems: items,
          hiddenItems,
          ready
        })}
      </div>
    </div>
  );
};

ResizeContainer.propTypes = {
  children: PropTypes.func,
  className: PropTypes.string,
  isRTL: PropTypes.bool,
  hideAllWidth: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.object),
  offset: PropTypes.number,
};

ResizeContainer.defaultProps = {
  offset: 100,
};

export default ResizeContainer;
