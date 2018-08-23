import React, { Component } from 'react';
import { isFunction, kebabCase } from 'lodash';
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
import css from './ProfileDropdown.css';
import { withModules } from '../../Modules';
import { getHandlerComponent } from '../../../handlerService';
import validations from '../../../userDropdownLinksService';

class ProfileDropdown extends Component {
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
  };

  constructor(props) {
    super(props);

    this.state = { dropdownOpen: false };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getDropdownContent = this.getDropdownContent.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.getProfileImage = this.getProfileImage.bind(this);

    const modulesWithLinks = this.getModulesWithLinks();
    this.userLinks = modulesWithLinks.reduce((acc, m) => {
      const links = m.links.userDropdown.map((link, index) => this.createLink(link, index, m));
      return acc.concat(links);
    }, []);
  }

  getModulesWithLinks() {
    const { modules } = this.props;
    return ([].concat(...Object.values(modules)))
      .filter(({ links }) => links && Array.isArray(links.userDropdown));
  }

  createLink(link, index, module) {
    const { stripes } = this.props;
    const { check, event } = link;
    const buttonId = `${kebabCase(module.displayName)}-clickable-menuItem${index}`;

    if (!check || (isFunction(validations[check]) && validations[check](stripes))) {
      if (event) {
        const HandlerComponent = getHandlerComponent(event, stripes, module);
        return (<HandlerComponent key={buttonId} stripes={stripes} />);
      } else {
        return this.renderNavLink(link, buttonId);
      }
    }

    return null;
  }

  renderNavLink(link, id) {
    return (
      <NavListItem id={id} key={id} type="button" onClick={() => this.navigateByUrl(link.route)}>
        <FormattedMessage id={link.caption} />
      </NavListItem>
    );
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
            {this.userLinks}
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

export default withModules(ProfileDropdown);
