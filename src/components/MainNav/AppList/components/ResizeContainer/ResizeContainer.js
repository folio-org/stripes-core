/**
 * AppList -> ResizeContainer
 */

import React, { useEffect, useState, useRef, createRef } from 'react';
import get from 'lodash/get';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import css from './ResizeContainer.css';

const ResizeContainer = ({ className, children, hideAllWidth, offset, items: allItems }) => {
  const wrapperRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [hiddenItems, setHiddenItems] = useState([]);
  const [cachedItemWidths, setCachedItemWidths] = useState({});

  // Assign a ref for each item on mount
  const [refs] = useState(() => allItems.reduce((acc, app) => {
    return Object.assign(acc, { [app.id]: createRef(null) });
  }, {}));

  /**
   * Determine hidden items on mount and resize
   */
  const updateHiddenItems = debounce(() => {
    const shouldHideAll = window.innerWidth <= hideAllWidth;
    const wrapperEl = wrapperRef.current;

    if (wrapperEl) {
      const wrapperWidth = wrapperEl.clientWidth;

      const newHiddenItems =
      // Set all items as hidden
      shouldHideAll ? Object.keys(refs) :

      // Find items that should be hidden
        Object.keys(refs).reduce((acc, id) => {
          const itemWidth = cachedItemWidths[id];
          const shouldBeHidden = (itemWidth + acc.accWidth + offset) > wrapperWidth;
          const hidden = shouldBeHidden ? acc.hidden.concat(id) : acc.hidden;

          return {
            hidden,
            accWidth: acc.accWidth + itemWidth,
          };
        }, {
          hidden: [],
          accWidth: 0,
        }).hidden;

      setHiddenItems(newHiddenItems);

      // We are hiding the content until we are finished setting hidden items (if any)
      // Setting ready will make the contents visible for the user
      if (!ready) {
        setReady(true);
      }
    }
  }, 150);

  useEffect(() => {
    // Cache menu item widths on mount since it's unlikely they will change
    setCachedItemWidths(Object.keys(refs).reduce((acc, id) => Object.assign(acc, { [id]: get(refs, `${id}.current.clientWidth`) }), {}));

    return () => {
      window.removeEventListener('resize', updateHiddenItems, true);
    };
  }, []);

  // Wait until widths has been cached before determining hidden items
  useEffect(() => {
    if (Object.keys(cachedItemWidths).length) {
      // Determine hidden items
      updateHiddenItems();

      // On resize
      window.addEventListener('resize', updateHiddenItems, true);
    }
  }, [cachedItemWidths]);

  return (
    <div
      ref={wrapperRef}
      className={classnames(css.resizeContainerWrapper, { [css.ready]: ready }, className)}
      data-test-resize-container
    >
      <div className={css.resizeContainerInner}>
        {children({
          hiddenItems,
          itemWidths: cachedItemWidths,
          ready,
          refs
        })}
      </div>
    </div>
  );
};

ResizeContainer.propTypes = {
  children: PropTypes.func,
  className: PropTypes.string,
  hideAllWidth: PropTypes.number,
  items: PropTypes.arrayOf(PropTypes.object),
  offset: PropTypes.number,
};

ResizeContainer.defaultProps = {
  offset: 200,
};

export default ResizeContainer;
