/**
 * Current App Button
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@folio/stripes-components/lib/Button';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import AppIcon from '@folio/stripes-components/lib/AppIcon';
import css from './CurrentApp.css';

export default class CurrentApp extends Component {
  static propTypes = {
    label: PropTypes.string,
    title: PropTypes.string,
  }
  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  toggleDropdown() {
    this.setState({
      // dropdownOpen: !this.state.dropdownOpen,
    });
  }

  render() {
    const { props, state, toggleDropdown } = this;
    const { dropdownOpen } = state;
    const { label, title } = props;
    return (
      <Dropdown
        id="currentAppDropdown"
        open={dropdownOpen}
        onToggle={toggleDropdown}
        group
        pullRight
      >
        <Button onClick={toggleDropdown} buttonStyle="transparent" buttonClass={css.currentAppButton} title={title}>
          <AppIcon
            iconStyle="block"
          />
          <span className={css.currentAppButtonLabel}>{label}</span>
        </Button>
        <DropdownMenu
          data-role="menu"
          aria-label="Current App Menu"
          onToggle={toggleDropdown}
        >
          <ul>
            <li><a href="#">Example Link 1</a></li>
            <li><a href="#">Example Link 2</a></li>
          </ul>
        </DropdownMenu>
      </Dropdown>
    );
  }
}
