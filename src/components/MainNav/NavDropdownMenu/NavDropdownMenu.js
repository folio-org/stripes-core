import React from 'react';
import PropTypes from 'prop-types';
// import ReactDOM from 'react-dom';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import css from './NavDropdownMenu.css';

const propTypes = {
  pullRight: PropTypes.bool,
  size: PropTypes.string,
  open: PropTypes.bool,
  children: PropTypes.element.isRequired,
};

class NavDropdownMenu extends React.Component {
  constructor(props) {
    super(props);

    this.ddContainer = null;
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
    const {
      bsRole, // eslint-disable-line
      onSelect, // eslint-disable-line
      onToggle, // eslint-disable-line
      open, // eslint-disable-line
      pullRight,
      bsClass, // eslint-disable-line
      labelledBy, // eslint-disable-line
      onClose, // eslint-disable-line
      rootCloseEvent, // eslint-disable-line
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
        <RootCloseWrapper onRootClose={onToggle}>
          {menu}
        </RootCloseWrapper>
      );
    }

    return menu;
  }
}

NavDropdownMenu.propTypes = propTypes;

export default NavDropdownMenu;
