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
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import List from '@folio/stripes-components/lib/List';
import NavDropdownMenu from '../NavDropdownMenu';
import NavButton from '../NavButton';
import css from './MyProfile.css';
import { withModules } from '../../Modules';
import userDropdownChecks from '../../../userDropdownLinksService';

class MyProfile extends Component {
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
      okapi: PropTypes.object,
    }).isRequired,
    modules: PropTypes.shape({
      app: PropTypes.array,
      settings: PropTypes.array,
    }),
    onLogout: PropTypes.func.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      dropdownOpen: false,
      userLinks: [],
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getDropdownContent = this.getDropdownContent.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.getProfileImage = this.getProfileImage.bind(this);
  }

  componentDidMount() {
    const { modules, stripes } = this.props;
    const userDropdownLinks = ([].concat(modules.app, modules.settings))
      .filter(({ links }) => links && Array.isArray(links.userDropdown))
      .reduce((result, { links }) => result.concat(links.userDropdown), []);

    userDropdownLinks.forEach((link, index) => {
      const linkFunction = link.check;
      if (!linkFunction) {
        this.createLink(link, index);
      } else if (typeof userDropdownChecks[linkFunction] === 'function') {
        if (userDropdownChecks[linkFunction](stripes)) {
          this.createLink(link, index);
        }
      }
    });
  }

  createLink(link, index) {
    const buttonId = `clickable-menuItem${index}`;
    const newItem = (
      <NavListItem id={buttonId} key={buttonId} type="button" onClick={() => this.navigateByUrl(link.route)}>
        <FormattedMessage id={link.caption} />
      </NavListItem>
    );
    this.setState({ userLinks: this.state.userLinks.concat(newItem) });
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

  navigateByUrl = (url) => {
    this.toggleDropdown();
    this.context.router.history.push(url);
  }

  onHome = () => {
    this.navigateByUrl('/');
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
        <header className={css.header}>
          <FormattedMessage id="stripes-core.loggedInAs" values={{ firstName: user.firstName, lastName: user.lastName }} />
          <br />
          {
            user.curServicePoint ?
              <FormattedMessage id="stripes-core.currentServicePoint" values={{ name: user.curServicePoint.name }} /> :
              <FormattedMessage id="stripes-core.currentServicePointNotSelected" />
          }
        </header>
        <hr className={css.divider} />
        <NavList>
          <NavListSection>
            {
              (!stripes.config || !stripes.config.showHomeLink) ?
                null :
                <NavListItem id="clickable-home" type="button" onClick={this.onHome}>
                  <FormattedMessage id="stripes-core.front.home" />
                </NavListItem>
            }
            {this.state.userLinks}
            <NavListItem id="clickable-logout" type="button" onClick={onLogout}>
              <FormattedMessage id="stripes-core.logout" />
            </NavListItem>
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

export default withModules(MyProfile);
