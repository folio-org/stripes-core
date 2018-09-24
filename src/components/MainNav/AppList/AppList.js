/**
 * App Switcher
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';

import AppListDropdown from './AppListDropdown';
import NavButton from '../NavButton';
import css from './AppList.css';

const propTypes = {
  dropdownId: PropTypes.string,
  dropdownToggleId: PropTypes.string.isRequired,
  searchfieldId: PropTypes.string.isRequired,
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
};

class AppList extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.getDropdownToggleButton = this.getDropdownToggleButton.bind(this);
    this.getNavButtons = this.getNavButtons.bind(this);
    this.toggleDropdown = this.toggleDropdown.bind(this);
  }

  /**
   * Get the nav buttons that is displayed
   * in the app header on desktop
   */
  getNavButtons() {
    return this.props.apps.filter((a, i) => i < 5).map(app => (
      <li className={css.navItem} key={app.id}>
        <NavButton
          label={app.displayName}
          id={app.id}
          selected={app.active}
          href={app.active ? null : app.href}
          title={app.displayName}
          iconKey={app.name}
          iconData={app.iconData}
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
      document.getElementById(this.props.dropdownToggleId).focus();
    }

    this.setState({
      open: !this.state.open,
    });
  }

  /**
   * The button that toggles the dropdown
   */
  getDropdownToggleButton() {
    const { dropdownToggleId } = this.props;
    const icon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.4 2.4H5.1c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7V5.1c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7H5.1c-.4 0-.7-.3-.7-.7V5.1c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM18.9 2.4h-3.3c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7V5.1c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7h-3.3c-.4 0-.7-.3-.7-.7V5.1c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM8.4 12.9H5.1c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7v-3.3c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7H5.1c-.4 0-.7-.3-.7-.7v-3.3c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3zM18.9 12.9h-3.3c-1.5 0-2.7 1.2-2.7 2.7v3.3c0 1.5 1.2 2.7 2.7 2.7h3.3c1.5 0 2.7-1.2 2.7-2.7v-3.3c0-1.5-1.2-2.7-2.7-2.7zm.7 6c0 .4-.3.7-.7.7h-3.3c-.4 0-.7-.3-.7-.7v-3.3c0-.4.3-.7.7-.7h3.3c.4 0 .7.3.7.7v3.3z" /></svg>;

    return (
      <NavButton
        label="Apps"
        key="mobile-dropdown-toggle"
        title="Show applications"
        data-role="toggle"
        className={css.navMobileToggle}
        onClick={this.toggleDropdown}
        selected={this.state.open}
        icon={icon}
        id={dropdownToggleId}
        noSelectedBar
      />
    );
  }

  render() {
    const { getNavButtons, getDropdownToggleButton, toggleDropdown } = this;
    const { dropdownId, apps, searchfieldId, dropdownToggleId } = this.props;
    const tether = {
      attachment: 'top right',
      targetAttachment: 'bottom right',
    };

    return (
      <nav className={css.appList}>
        <ul className={css.navItemsList}>
          { getNavButtons() }
        </ul>
        <div className={css.navListDropdownWrap}>
          <Dropdown tether={tether} dropdownClass={css.navListDropdown} open={this.state.open} id={dropdownId} onToggle={toggleDropdown}>
            { getDropdownToggleButton() }
            <DropdownMenu data-role="menu" onToggle={toggleDropdown}>
              <AppListDropdown
                apps={apps}
                searchfieldId={searchfieldId}
                dropdownToggleId={dropdownToggleId}
                toggleDropdown={toggleDropdown}
              />
            </DropdownMenu>
          </Dropdown>
        </div>
      </nav>
    );
  }
}

AppList.propTypes = propTypes;

export default AppList;
