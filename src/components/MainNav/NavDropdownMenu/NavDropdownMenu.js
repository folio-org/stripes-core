import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import RootCloseWrapper from '@folio/stripes-components/util/RootCloseWrapper';
import css from './NavDropdownMenu.css';

const propTypes = {
  bsClass: PropTypes.string,
  bsRole: PropTypes.string,
  children: PropTypes.element.isRequired,
  labelledBy: PropTypes.string,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  onToggle: PropTypes.func,
  open: PropTypes.bool,
  pullRight: PropTypes.bool,
  rootCloseEvent: PropTypes.func,
  size: PropTypes.string,
};

class NavDropdownMenu extends React.Component {
  constructor(props) {
    super(props);

    this.ddContainer = null;
    this.closeWrapperRef = createRef(null);
  }

  getItemsAndActiveIndex() {
    const items = this.getFocusableMenuItems();
    const activeIndex = items.indexOf(document.activeElement);

    return { items, activeIndex };
  }

  getFocusableMenuItems() {
    const node = this.ddContainer;
    if (!node) {
      return [];
    }

    return Array.from(node.querySelectorAll('button, input, a, select, [tabIndex="-1"]'));
  }

  focusNext() {
    const { items, activeIndex } = this.getItemsAndActiveIndex();
    if (items.length === 0) {
      return;
    }

    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    items[nextIndex].focus();
  }

  focusPrev() {
    const { items, activeIndex } = this.getItemsAndActiveIndex();
    if (items.length === 0) {
      return;
    }

    const prevIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    items[prevIndex].focus();
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      bsRole,
      onSelect,
      onToggle,
      open,
      pullRight,
      bsClass,
      labelledBy,
      onClose,
      rootCloseEvent,
      ...ddprops
    } = this.props;

    const position = {
      left: pullRight ? 'initial' : '0',
      display: this.props.open ? 'block' : 'none',
      right: pullRight ? '0' : 'initial',
    };

    const menu = (
      <div className={css.DropdownMenu} aria-expanded="true" style={position} {...ddprops} ref={(ref) => { this.ddContainer = ref; }}>
        { this.props.children }
      </div>
    );

    if (this.props.open) {
      return (
        <RootCloseWrapper onRootClose={onToggle} ref={this.closeWrapperRef}>
          {menu}
        </RootCloseWrapper>
      );
    }

    return menu;
  }
}

NavDropdownMenu.propTypes = propTypes;

export default NavDropdownMenu;
