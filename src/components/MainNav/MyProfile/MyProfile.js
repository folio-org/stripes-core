/**
 * My profile
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import NavList from '@folio/stripes-components/lib/NavList';
import Avatar from '@folio/stripes-components/lib/Avatar';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import List from '@folio/stripes-components/lib/List';
import NavDropdownMenu from '../NavDropdownMenu';
import NavButton from '../NavButton';
import css from './MyProfile.css';

export default class MyProfile extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    stripes: PropTypes.shape({
      user: PropTypes.shape({
        user: PropTypes.object,
        perms: PropTypes.object,
      }),
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        showHomeLink: PropTypes.bool,
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
    return (<Avatar alt={user.name} title={user.name} />);
  }

  onHome = () => {
    this.toggleDropdown();
    this.context.router.history.push('/');
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
            {
              (!stripes.config || !stripes.config.showHomeLink) ?
                null :
                <button id="clickable-home" type="button" onClick={this.onHome}>
                  <FormattedMessage id="stripes-core.front.home" />
                </button>
            }
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
      <Dropdown open={dropdownOpen} id="profileDropdown" onToggle={this.toggleDropdown} pullRight hasPadding>
        <NavButton data-role="toggle" title="My Profile" selected={dropdownOpen} icon={this.getProfileImage()} noSelectedBar />
        <NavDropdownMenu data-role="menu" onToggle={this.toggleDropdown}>
          {this.getDropdownContent()}
        </NavDropdownMenu>
      </Dropdown>
    );
  }
}
