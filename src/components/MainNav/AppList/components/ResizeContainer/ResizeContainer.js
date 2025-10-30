/**
 * AppList -> ResizeContainer
 */

import React from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import css from './ResizeContainer.css';

class ResizeContainer extends React.Component {
  static propTypes = {
    children: PropTypes.func,
    currentAppId: PropTypes.string,
    className: PropTypes.string,
    hideAllWidth: PropTypes.number,
    items: PropTypes.arrayOf(PropTypes.object),
    offset: PropTypes.number,
  }

  static defaultProps = {
    offset: 200,
  }

  constructor(props) {
    super(props);

    this.wrapperRef = React.createRef(null);
    this.cachedItemWidths = {};
  }

  state = {
    ready: false,
    hiddenItems: [],
  }

  componentDidMount() {
    this.initialize();
    window.addEventListener('resize', this.onResize, true);
  }

  componentDidUpdate(prevProps) {
    const { currentAppId, items } = this.props;

    const itemIds = items.reduce((acc, { id }) => {
      acc[id] = true;
      return acc;
    }, {});

    const prevItemIds = prevProps.items.reduce((acc, { id }) => {
      acc[id] = true;
      return acc;
    }, {});

    const hasSetOfItemsChanged = !isEqual(itemIds, prevItemIds);

    // Only re-cache widths when the set of item IDs changes (not when their order changes).
    // This allows items that don't fit within the container to be hidden when resized or clicked.
    if (hasSetOfItemsChanged) {
      // Clear cached widths and show all items temporarily to measure them accurately
      this.cachedItemWidths = {};
      this.setState({ hiddenItems: [] }, () => {
        requestAnimationFrame(() => {
          this.cacheWidthsOfItems();
          this.updateHiddenItems();
        });
      });
    }
    // Update hidden items when the current app ID changes
    // to make sure that no items are hidden behind the current app label
    else if (currentAppId !== prevProps.currentAppId ||
      !isEqual(items, prevProps.items)
    ) {
      this.updateHiddenItems();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize, true);
  }

  cacheWidthsOfItems = () => {
    const { items } = this.props;

    this.cachedItemWidths = items.reduce((acc, { id }) => Object.assign(acc, {
      [id]: document.getElementById(`app-list-item-${id}`).parentNode.offsetWidth,
    }), {});
  }

  initialize = () => {
    const { items } = this.props;

    if (!items.length) {
      return;
    }

    this.cacheWidthsOfItems();
    // Determine which items should be visible and hidden
    this.updateHiddenItems(() => {
      // We are hiding the content until we are finished setting hidden items (if any)
      // Setting ready will make the contents visible for the user
      this.setState({
        ready: true
      });
    });
  }

  /**
   * Determine hidden items on mount and resize
   */
  updateHiddenItems = (callback) => {
    const { hideAllWidth, offset, items } = this.props;
    const shouldHideAll = window.innerWidth <= hideAllWidth;
    const wrapperEl = this.wrapperRef.current;

    if (wrapperEl) {
      const wrapperWidth = wrapperEl.clientWidth;

      const newHiddenItems =
      // Set all items as hidden
      shouldHideAll ? Object.keys(this.cachedItemWidths) :

        // Find items that should be hidden
        items.reduce((acc, { id }) => {
          const itemWidth = this.cachedItemWidths[id];
          const shouldBeHidden = (itemWidth + acc.accWidth + offset) > wrapperWidth;
          const hidden = shouldBeHidden ? acc.hidden.concat(id) : acc.hidden;

          return {
            hidden,
            accWidth: acc.accWidth + itemWidth,
          };
        },
        {
          hidden: [],
          accWidth: 0,
        }).hidden;

      this.setState({
        hiddenItems: newHiddenItems
      }, callback);
    }
  }

  onResize = debounce(() => {
    this.updateHiddenItems();
  }, 150)

  render() {
    const { ready, hiddenItems } = this.state;
    const { className, children } = this.props;

    return (
      <div
        ref={this.wrapperRef}
        className={classnames(css.resizeContainerWrapper, { [css.ready]: ready }, className)}
        data-test-resize-container
      >
        <div className={css.resizeContainerInner}>
          {children({
            hiddenItems,
            itemWidths: this.cachedItemWidths,
            ready,
          })}
        </div>
      </div>
    );
  }
}

export default ResizeContainer;
