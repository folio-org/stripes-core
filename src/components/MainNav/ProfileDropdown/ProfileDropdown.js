import React, { Component, Fragment } from 'react';
import { isFunction, kebabCase } from 'lodash';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown';
import NavList from '@folio/stripes-components/lib/NavList';
import Avatar from '@folio/stripes-components/lib/Avatar';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import Icon from '@folio/stripes-components/lib/Icon';
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import List from '@folio/stripes-components/lib/List';

import NavDropdownMenu from '../NavDropdownMenu';
import NavButton from '../NavButton';
import css from './ProfileDropdown.css';
import { withModules } from '../../Modules';
import { getHandlerComponent } from '../../../handlerService';
import validations from '../../../userDropdownLinksService';
import IntlConsumer from '../../IntlConsumer';

class ProfileDropdown extends Component {
  static propTypes = {
    modules: PropTypes.shape({
      app: PropTypes.array,
      settings: PropTypes.array,
    }),
    onLogout: PropTypes.func.isRequired,
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
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {};

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.getDropdownContent = this.getDropdownContent.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.getProfileImage = this.getProfileImage.bind(this);
    this.createHandlerComponent = this.createHandlerComponent.bind(this);
    this.navigateByUrl = this.navigateByUrl.bind(this);

    const modulesWithLinks = this.getModulesWithLinks();
    this.userLinks = modulesWithLinks.reduce((acc, m) => {
      const links = m.links.userDropdown.map((link, index) => this.createLink(link, index, m));
      return acc.concat(links);
    }, []);
  }

  setInitialState(callback) {
    this.setState({
      dropdownOpen: false,
      HandlerComponent: null,
    }, callback);
  }

  getModulesWithLinks() {
    const { modules } = this.props;
    return ([].concat(...Object.values(modules)))
      .filter(({ links }) => links && Array.isArray(links.userDropdown));
  }

  createHandlerComponent(link, module) {
    const { stripes } = this.props;
    const HandlerComponent = getHandlerComponent(link.event, stripes, module);

    // forces to recreate a handler component
    this.setInitialState(() => this.setState({ HandlerComponent }));
  }

  createLink(link, index, module) {
    const { stripes } = this.props;
    const { check } = link;
    const checkfn = !check ? undefined : (module.getModule()[check] || validations[check]);

    if (!check || (isFunction(checkfn) && checkfn(stripes))) {
      return this.renderNavLink(link, index, module);
    }

    return null;
  }

  onNavItemClicked(link, module) {
    const handler = (link.event) ? this.createHandlerComponent : this.navigateByUrl;
    this.toggleDropdown();
    handler(link, module);
  }

  renderNavLink(link, index, module) {
    const buttonId = `${kebabCase(module.displayName)}-clickable-menuItem${index}`;
    return (
      <NavListItem id={buttonId} key={buttonId} type="button" onClick={() => this.onNavItemClicked(link, module)}>
        <FormattedMessage id={link.caption} />
      </NavListItem>
    );
  }

  toggleDropdown() {
    this.setState(({ dropdownOpen }) => ({
      dropdownOpen: !dropdownOpen
    }));
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
    return (
      <Avatar
        alt={user.name}
        ariaLabel={user.name}
        className={css.avatar}
      />);
  }

  navigateByUrl(link) {
    this.props.history.push(link.route);
  }

  onHome = () => {
    this.navigateByUrl({ route: '/' });
  };

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
      perms = (
        <IntlConsumer>
          {
            intl => {
              const items = [
                `Locale: ${intl.locale}`,
                `Perms: ${Object.keys(currentPerms || {}).sort().join(', ')}`,
              ];

              return (
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
          }
        </IntlConsumer>
      );
    }

    return (
      <div>
        <div className={css.header}>
          <FormattedMessage id="stripes-core.loggedInAs" values={{ firstName: user.firstName, lastName: user.lastName }} />
          <br />
          {
            user.curServicePoint ?
              <FormattedMessage id="stripes-core.currentServicePoint" values={{ name: user.curServicePoint.name }} /> :
              <FormattedMessage id="stripes-core.currentServicePointNotSelected" />
          }
        </div>
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
      </div>
    );
  }

  render() {
    const { dropdownOpen, HandlerComponent } = this.state;
    const user = this.getUserData();

    return (
      <IntlConsumer>
        {intl => (
          <Fragment>
            { HandlerComponent && <HandlerComponent stripes={this.props.stripes} /> }
            <Dropdown open={dropdownOpen} id="profileDropdown" onToggle={this.toggleDropdown} pullRight hasPadding>
              <NavButton
                data-role="toggle"
                ariaLabel={intl.formatMessage({ id: 'stripes-core.mainnav.myProfileAriaLabel' })}
                selected={dropdownOpen}
                className={css.button}
                icon={this.getProfileImage()}
                label={user.curServicePoint ? (
                  <Fragment>
                    <span className={css.button__label}>
                      {user.curServicePoint.name}
                    </span>
                    <Icon icon={dropdownOpen ? 'caret-up' : 'caret-down'} />
                  </Fragment>
                ) : null}
              />
              <NavDropdownMenu data-role="menu" onToggle={this.toggleDropdown}>
                {this.getDropdownContent()}
              </NavDropdownMenu>
            </Dropdown>
          </Fragment>
        )}
      </IntlConsumer>
    );
  }
}

export default compose(
  withRouter,
  withModules,
)(ProfileDropdown);
