/**
 * My profile
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import List from '@folio/stripes-components/lib/List';
import NavDropdownMenu from '../NavDropdownMenu';
import NavButton from '../NavButton';
import css from './MyProfile.css';

export default class MyProfile extends Component {
  static propTypes = {
    stripes: PropTypes.shape({
      user: PropTypes.shape({
        user: PropTypes.object,
        perms: PropTypes.object,
      }),
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
      }),
    }).isRequired,
    onLogout: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getDropdownContent = this.getDropdownContent.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.getProfileImage = this.getProfileImage.bind(this);
  }

  toggleDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  getUserData() {
    const { stripes: { user } } = this.props;

    if (user.user) {
      return user.user;
    }
    return {};
  }

  getProfileImage() {
    const user = this.getUserData();

    /* Note: This is not yet available - only prepared for here */
    const profileImage = user.image_url;

    if (profileImage) {
      return (
        <img src={profileImage} alt={user.name} />
      );
    }

    /* Profile image placeholder if no image was found */
    return (
      <div className={css.profileImage}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.2 19.4c-1.1.4-2.1.7-3.2 1.1-1.2.4-2.3.9-3.4 1.5-.2.1-.3.2-.5.3-.5.3-.7.8-.8 1.3v.3h23.2v-.4c0-.4-.2-.8-.5-1-.5-.4-1.1-.8-1.7-1.1-1.6-.8-3.2-1.3-4.9-1.9-.3-.1-.6-.2-.9-.4-.3-.2-.5-.4-.5-.8-.1-.5 0-1.1 0-1.6 0-.4.1-.8.4-1.1.6-.7.8-1.6 1-2.5.1-.4.2-.8.4-1.1.3-.6.5-1.3.5-1.9v-.5c-.3-.7-.1-1.2 0-1.9s.1-1.4-.2-2.1C16.3 4 14.9 3 12.9 2.7c-1.2-.2-2.4.1-2.7.2-1.9.6-3.1 1.8-3.5 3.7-.1.5 0 1 0 1.5 0 .3.1.6.1.8 0 .3 0 .6-.1.8-.1.2-.1.5-.1.7.1.7.3 1.3.6 1.9.2.4.2.8.3 1.2.2.8.4 1.7 1 2.3.4.4.5.7.5 1v1.5c0 .5-.2.9-.8 1.1z" /></svg>
      </div>
    );
  }

  getDropdownContent() {
    const { stripes, onLogout } = this.props;
    const user = this.getUserData();
    const currentPerms = stripes.user ? stripes.user.perms : undefined;

    /**
     * Show perms, locale etc.
     * if setting is active in stripes config
     */
    let perms = null;
    if (stripes.config && stripes.config.showPerms) {
      const items = [
        `Locale: ${stripes.locale}`,
        `Perms: ${Object.keys(currentPerms || {}).sort().join(', ')}`,
      ];
      perms = (
        <section>
          <hr className={css.divider} />
          <List
            items={items}
            itemFormatter={(item, index) => (<li key={index}>{item}</li>)}
            marginBottom0
          />
        </section>
      );
    }

    return (
      <main>
        <header className={css.loggedInAs}>
          Logged in as {`${user.firstName} ${user.lastName}`}
        </header>
        <hr className={css.divider} />
        <NavList>
          <NavListSection activeLink="none">
            <button id="clickable-logout" type="button" onClick={onLogout}>Log out</button>
          </NavListSection>
        </NavList>
        { perms }
      </main>
    );
  }

  render() {
    const { dropdownOpen } = this.state;
    return (
      <Dropdown open={dropdownOpen} id="profileDropdown" onToggle={this.toggleDropdown} pullRight >
        <NavButton data-role="toggle" title="My Profile" selected={dropdownOpen} icon={this.getProfileImage()} noSelectedBar />
        <NavDropdownMenu data-role="menu" onToggle={this.toggleDropdown}>
          {this.getDropdownContent()}
        </NavDropdownMenu>
      </Dropdown>
    );
  }
}
