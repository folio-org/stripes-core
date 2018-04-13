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
  }

  /**
   * Get the nav buttons that is displayed
   * in the app header on desktop
   */
  getNavButtons = () => {
    const { apps } = this.props;

    return apps.map(app => (
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
  toggleDropdown = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  /**
   * The button that toggles the dropdown
   */
  getDropdownToggleButton = () => {
    const { searchfieldId, dropdownToggleId } = this.props;

    const icon = (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.9 2.2H2.7c-.4 0-.7.4-.7.7v4.2c0 .4.3.7.7.7h4.2c.4 0 .7-.3.7-.7V2.9c0-.3-.3-.7-.7-.7zM14 2.2H9.8c-.4 0-.8.4-.8.7v4.2c0 .4.3.7.7.7H14c.4 0 .7-.3.7-.7V2.9c0-.3-.3-.7-.7-.7zM21 2.2h-4.2c-.4 0-.7.3-.7.7v4.2c0 .4.3.7.7.7H21c.4 0 .7-.3.7-.7V2.9c0-.3-.3-.7-.7-.7zM6.9 9.3H2.7c-.4 0-.7.3-.7.7v4.2c0 .4.3.7.7.7h4.2c.4 0 .7-.3.7-.7V10c0-.4-.3-.7-.7-.7zM14 9.3H9.8c-.4 0-.8.3-.8.7v4.2c0 .4.3.7.7.7H14c.4 0 .7-.3.7-.7V10c0-.4-.3-.7-.7-.7zM21 9.3h-4.2c-.4 0-.7.3-.7.7v4.2c0 .4.3.7.7.7H21c.4 0 .7-.3.7-.7V10c0-.4-.3-.7-.7-.7zM6.9 16.3H2.7c-.4 0-.7.3-.7.7v4.2c0 .4.3.8.7.8h4.2c.4 0 .7-.3.7-.7V17c0-.4-.3-.7-.7-.7zM14 16.3H9.8c-.4 0-.8.3-.8.7v4.2c0 .4.4.8.8.8H14c.4 0 .7-.3.7-.7V17c0-.4-.3-.7-.7-.7zM21 16.3h-4.2c-.4 0-.7.3-.7.7v4.2c0 .4.3.7.7.7H21c.4 0 .7-.3.7-.7V17c0-.4-.3-.7-.7-.7z" /></svg>);

    return [
      // TO-DO!
      // Here we are going to place a button for desktop as well
      // once that's ready to get imlemented (re-ordering is needed for this to be relevant)
      <NavButton
        key="mobile-dropdown-toggle"
        title="Show applications"
        data-role="toggle"
        className={css.navMobileToggle}
        onClick={this.toggleDropdown}
        selected={this.state.open}
        icon={icon}
        id={dropdownToggleId}
        noSelectedBar
      />,
      // Only activate focus trap if dropdown is open
      this.state.open ? <input key="mobile-dropdown-focus-trap" className={css.focusTrap} onFocus={() => document.getElementById(searchfieldId).focus()} /> : null,
    ];
  }

  render() {
    const { getNavButtons, getDropdownToggleButton, toggleDropdown } = this;
    const { dropdownId, apps, searchfieldId, dropdownToggleId } = this.props;

    return (
      <nav className={css.appList}>
        <ul className={css.navItemsList}>
          { getNavButtons() }
        </ul>
        <div className={css.navListDropdownWrap}>
          <Dropdown dropdownClass={css.navListDropdown} open={this.state.open} id={dropdownId} onToggle={toggleDropdown}>
            <div>{ getDropdownToggleButton() }</div>
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
