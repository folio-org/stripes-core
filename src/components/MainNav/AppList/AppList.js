/**
 * App List
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import Icon from '@folio/stripes-components/lib/Icon';

import AppListDropdown from './AppListDropdown';
import NavButton from '../NavButton';
import css from './AppList.css';

class AppList extends Component {
  static propTypes = {
    dropdownId: PropTypes.string,
    dropdownToggleId: PropTypes.string.isRequired,
    apps: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string,
        description: PropTypes.string,
        id: PropTypes.string,
        href: PropTypes.string,
        active: PropTypes.bool,
        name: PropTypes.string,
        icon: PropTypes.string,
        iconData: PropTypes.object, // Only need because "Settings" isn't a standalone app yet
      }),
    ),
    selectedApp: PropTypes.object,
  }

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.maxRenderedNavButtons = 12;

    this.state = {
      open: false,
    };

    this.getDropdownToggleButton = this.getDropdownToggleButton.bind(this);
    this.getNavButtons = this.getNavButtons.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.focusDropdownToggleButton = this.focusDropdownToggleButton.bind(this);
    this.focusFirstItemInList = this.focusFirstItemInList.bind(this);

    this.dropdownListRef = React.createRef();
    this.dropdownToggleRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    const selectedApp = this.props.selectedApp;

    // Set focus on dropdown when it opens
    if (this.state.open && !prevState.open) {
      // If there's an active app
      if (selectedApp) {
        this.focusSelectedItem();
      // If not; focus first item in the list
      } else {
        this.focusFirstItemInList();
      }
    }
  }

  /**
   * Get the nav buttons that is displayed
   * in the app header on desktop
   */
  getNavButtons() {
    return this.props.apps.filter((a, i) => i < this.maxRenderedNavButtons).map(app => (
      <li className={css.navItem} key={app.id}>
        <NavButton
          label={app.displayName}
          id={app.id}
          selected={app.active}
          href={app.active ? null : app.href}
          aria-label={app.displayName}
          iconKey={app.name}
          iconData={app.iconData}
          role="button"
        />
      </li>
    ));
  }

  /**
   * When dropdown is getting toggled
   */
  toggleDropdown() {
    // Re-focus dropdown toggle on close
    if (this.state.open) {
      this.focusDropdownToggleButton();
    }

    this.setState({
      open: !this.state.open,
    });
  }

  /**
   * The button that toggles the dropdown
   */
  getDropdownToggleButton() {
    const { open } = this.state;
    const { dropdownToggleId } = this.props;
    const icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.4 2.4H5.1c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7V5.1c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7H5.1c-.4 0-.7-.3-.7-.7V5.1c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM18.9 2.4h-3.3c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7V5.1c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7h-3.3c-.4 0-.7-.3-.7-.7V5.1c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM8.4 12.9H5.1c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7v-3.3c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7H5.1c-.4 0-.7-.3-.7-.7v-3.3c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM18.9 12.9h-3.3c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7v-3.3c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7h-3.3c-.4 0-.7-.3-.7-.7v-3.3c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3z" /></svg>;
    const label = <Icon iconPosition="end" icon={open ? 'up-caret' : 'down-caret'}>Apps</Icon>;

    return (
      <Fragment>
        <NavButton
          label={label}
          key="mobile-dropdown-toggle"
          aria-label="Show all applications"
          aria-haspopup="true"
          aria-expanded={open}
          data-role="toggle"
          className={css.navMobileToggle}
          labelClassName={css.dropdownToggleLabel}
          onClick={this.toggleDropdown}
          selected={this.state.open}
          icon={icon}
          id={dropdownToggleId}
          ref={this.dropdownToggleRef}
          noSelectedBar
        />
        { open && this.focusTrap(this.focusFirstItemInList) }
      </Fragment>
    );
  }


  /**
   * Focus management
   */
  focusFirstItemInList() {
    if (this.dropdownListRef && this.dropdownListRef.current) {
      this.dropdownListRef.current.firstChild.firstChild.focus();
    }
  }

  focusSelectedItem() {
    const selectedApp = this.props.selectedApp;
    if (selectedApp) {
      const activeElement = document.getElementById(`app-list-item-${selectedApp.id}`);
      if (activeElement) {
        activeElement.focus();
      }
    }
  }

  focusDropdownToggleButton() {
    if (this.dropdownToggleRef && this.dropdownToggleRef.current) {
      this.dropdownToggleRef.current.focus();
    }
  }

  /**
   * Insert hidden input to help trap focus
   */
  focusTrap(onFocus) {
    return <input aria-hidden="true" className={css.focusTrap} onFocus={onFocus} />;
  }

  render() {
    const { getNavButtons, getDropdownToggleButton, toggleDropdown } = this;
    const { dropdownId, apps, dropdownToggleId } = this.props;
    const tether = {
      attachment: 'top right',
      targetAttachment: 'bottom right',
    };

    // If no apps are installed
    if (!apps.length) {
      return null;
    }

    return (
      <nav className={css.appList}>
        <ul className={css.navItemsList}>
          { getNavButtons() }
        </ul>
        <div className={css.navListDropdownWrap}>
          <Dropdown tether={tether} dropdownClass={css.navListDropdown} open={this.state.open} id={dropdownId} onToggle={toggleDropdown}>
            { getDropdownToggleButton() }
            <DropdownMenu data-role="menu" onToggle={toggleDropdown}>
              { this.focusTrap(this.focusDropdownToggleButton) }
              <AppListDropdown
                listRef={this.dropdownListRef}
                apps={apps}
                dropdownToggleId={dropdownToggleId}
                toggleDropdown={toggleDropdown}
              />
              { this.focusTrap(this.focusFirstItemInList) }
            </DropdownMenu>
          </Dropdown>
        </div>
      </nav>
    );
  }
}

export default AppList;
