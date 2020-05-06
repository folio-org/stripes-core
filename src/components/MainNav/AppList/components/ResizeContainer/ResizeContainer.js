/**
 * AppList -> ResizeContainer
 */

import React from 'react';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
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
  }

  state = {
    ready: false,
    cachedItemWidths: [],
    hiddenItems: [],
  }

  componentDidMount() {
    this.initialize();
    window.addEventListener('resize', this.onResize, true);
  }

  componentDidUpdate(prevProps) {
    // Update hidden items when the current app ID changes
    // to make sure that no items are hidden behind the current app label
    if (this.props.currentAppId && this.props.currentAppId !== prevProps.currentAppId) {
      this.updateHiddenItems();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize, true);
  }

  initialize = () => {
    const { items } = this.props;

    if (!items.length) {
      return;
    }

    // Save widths of items since they will probably not change unless the local is changed
    this.setState({
      cachedItemWidths: items.reduce((acc, { id }) => Object.assign(acc, {
        [id]: document.getElementById(`app-list-item-${id}`).parentNode.offsetWidth,
      }), {})
    }, () => {
      // Determine which items should be visible and hidden
      this.updateHiddenItems(() => {
        // We are hiding the content until we are finished setting hidden items (if any)
        // Setting ready will make the contents visible for the user
        this.setState({
          ready: true
        });
      });
    });
  }

  /**
   * Determine hidden items on mount and resize
   */
  updateHiddenItems = (callback) => {
    const { hideAllWidth, offset } = this.props;
    const { cachedItemWidths } = this.state;
    const shouldHideAll = window.innerWidth <= hideAllWidth;
    const wrapperEl = this.wrapperRef.current;

    if (wrapperEl) {
      const wrapperWidth = wrapperEl.clientWidth;

      const newHiddenItems =
      // Set all items as hidden
      shouldHideAll ? Object.keys(cachedItemWidths) :

        // Find items that should be hidden
        Object.keys(cachedItemWidths).reduce((acc, id) => {
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

      this.setState({
        hiddenItems: newHiddenItems
      }, callback);
    }
  }

  onResize = debounce(() => {
    this.updateHiddenItems();
  }, 150)

  render() {
    const { ready, cachedItemWidths, hiddenItems } = this.state;
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
            itemWidths: cachedItemWidths,
            ready,
          })}
        </div>
      </div>
    );
  }
}

export default ResizeContainer;
