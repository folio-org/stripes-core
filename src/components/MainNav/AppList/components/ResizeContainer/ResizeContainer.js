/**
 * AppList -> ResizeContainer
 */

import React, { useEffect, useState, useRef, createRef } from 'react';
import classnames from 'classnames';
import differenceWith from 'lodash/differenceWith';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import css from './ResizeContainer.css';

const ResizeContainer = ({ className, children, items: allItems }) => {
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
    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const { left, right } = wrapperRect;
    const offset = 100;

    const newItems = items.map(item => {
      const rect = item.ref.current.getBoundingClientRect();
      const visible = (left + offset) <= rect.left;

      return Object.assign(item, {
        visible
      });
    });

    setItems(newItems);

    if (typeof callback === 'function') {
      callback();
    }
  };

  /**
   * On resize
   */
  const handleResize = () => {
    determineVisibleItems();
  };

  /**
   * On mount
   */
  useEffect(() => {
    window.addEventListener('resize', debounce(handleResize, 150), true);

    determineVisibleItems(() => setReady(true));

    return () => {
      window.removeEventListener('resize', handleResize, true);
    };
  }, []);

  /**
   * Update hidden items every time items array updates
   */
  useEffect(() => {
    setHiddenItems(items.filter(item => !item.visible));
  }, [items]);

  return (
    <div ref={wrapperRef} className={classnames(css.resizeContainerWrapper, { [css.ready]: ready }, className)}>
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
  className: PropTypes.string,
  children: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.object),
};

export default ResizeContainer;
