import React, { Component } from 'react';
import { isFunction, kebabCase } from 'lodash';
import { compose } from 'redux';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  Avatar,
  Dropdown,
  DropdownMenu,
  Icon,
  List,
  NavList,
  NavListItem,
  NavListSection,
} from '@folio/stripes-components';

import NavButton from '../NavButton';
import css from './ProfileDropdown.css';
import { withModules } from '../../Modules';
import { getEventHandler } from '../../../handlerService';
import validations from '../../../userDropdownLinksService';
import IntlConsumer from '../../IntlConsumer';

class ProfileDropdown extends Component {
  static propTypes = {
    modules: PropTypes.shape({
      app: PropTypes.arrayOf(PropTypes.object),
    }),
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        showHomeLink: PropTypes.bool,
      }),
      hasPerm: PropTypes.func,
      okapi: PropTypes.object,
      user: PropTypes.shape({
        user: PropTypes.object,
        perms: PropTypes.object,
      }),
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    intl: PropTypes.object,
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

    this.userLinks = this.getDropdownMenuLinks();
  }

  setInitialState(callback) {
    this.setState({
      HandlerComponent: null,
    }, callback);
  }

  getDropdownMenuLinks = () => {
    const modulesWithLinks = this.getModulesWithLinks();

    return modulesWithLinks.reduce((acc, m) => {
      const links = m.links.userDropdown.map((link, index) => this.createLink(link, index, m));
      return acc.concat(links);
    }, []);
  }

  getModulesWithLinks = () => {
    const { modules } = this.props;
    return Object.values(modules)
      .flat()
      .filter((module, index, self) => {
        return index === self.findIndex((m) => (
          m.module === module.module
        ));
      })
      .filter(({ links }) => links && Array.isArray(links.userDropdown));
  }

  createHandlerComponent(link, module) {
    const { stripes } = this.props;
    const HandlerComponent = getEventHandler(link.event, stripes, module);

    // forces to recreate a handler component
    this.setInitialState(() => this.setState({ HandlerComponent }));
  }

  createLink(link, index, module) {
    const { stripes } = this.props;
    const { check, route } = link;
    const isLocalLoginCheck = module.getModule()[check] || validations[check];
    let checkfn;

    if (route === '/settings/myprofile/password') {
      checkfn = check ? (stripes.hasPerm('ui-myprofile.settings.change-password') && isLocalLoginCheck) : null;
    } else {
      checkfn = check ? isLocalLoginCheck : null;
    }

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
    // Get items after rechecking for item visibility
    this.userLinks = this.getDropdownMenuLinks();

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
      />
    );
  }

  navigateByUrl(link) {
    this.props.history.push(link.route);
  }

  onHome = () => {
    this.toggleDropdown();
    this.navigateByUrl({ route: '/' });
  };

  getDropdownContent() {
    const { stripes } = this.props;
    const user = this.getUserData();
    const currentPerms = stripes.user ? stripes.user.perms : undefined;
    const messageId = stripes.okapi.ssoEnabled ? 'stripes-core.logoutKeepSso' : 'stripes-core.logout';

    /**
     * Show perms, locale etc.
     * if setting is active in stripes config
     */
    let perms = null;
    if (stripes.config?.showPerms) {
      perms = (
        <IntlConsumer>
          {
            intl => {
              const items = [
                `${intl.formatMessage({ id: 'stripes-core.mainnav.profileDropdown.locale' })}: ${intl.locale}`,
                `${intl.formatMessage({ id: 'stripes-core.mainnav.profileDropdown.permissions' })}: ${Object.keys(currentPerms || {}).sort().join(', ')}`,
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
              (!stripes.config?.showHomeLink) ?
                null :
                <NavListItem id="clickable-home" type="button" onClick={this.onHome}>
                  <FormattedMessage id="stripes-core.front.home" />
                </NavListItem>
            }
            {this.userLinks}
            <NavListItem id="clickable-logout" type="button" to="/logout">
              <FormattedMessage id={messageId} />
            </NavListItem>
          </NavListSection>
        </NavList>
        { perms }
      </div>
    );
  }

  renderProfileTrigger = ({ getTriggerProps, open }) => {
    const { intl, stripes: { okapi } } = this.props;
    const userData = this.getUserData();
    const servicePointName = userData?.curServicePoint?.name;
    const tenantName = userData?.tenants?.find(({ id }) => id === okapi.tenant)?.name;

    return (
      <NavButton
        ariaLabel={intl.formatMessage(
          { id: 'stripes-core.mainnav.myProfileAriaLabel' },
          {
            tenantName,
            servicePointName,
          }
        )}
        selected={open}
        className={css.button}
        icon={this.getProfileImage()}
        label={this.renderProfileTriggerLabel({ open })}
        {...getTriggerProps()}
      />
    );
  }

  renderProfileTriggerLabel = ({ open }) => {
    const { okapi } = this.props.stripes;
    const userData = this.getUserData();
    const servicePointName = userData?.curServicePoint?.name;
    const tenantName = userData?.tenants?.find(({ id }) => id === okapi.tenant)?.name;

    const hasLabel = Boolean(servicePointName || tenantName);

    return (
      hasLabel ? (
        <>
          <span className={css.button__label}>
            {tenantName && <span>{tenantName}</span>}
            {servicePointName && <span>{servicePointName}</span>}
          </span>
          <Icon icon={open ? 'caret-up' : 'caret-down'} />
        </>
      ) : null
    );
  }

  renderProfileMenu = ({ open }) => (
    <DropdownMenu open={open}>
      {this.getDropdownContent()}
    </DropdownMenu>
  );

  render() {
    const { HandlerComponent } = this.state;

    return (
      <>
        { HandlerComponent && <HandlerComponent stripes={this.props.stripes} /> }
        <Dropdown
          id="profileDropdown"
          renderTrigger={this.renderProfileTrigger}
          renderMenu={this.renderProfileMenu}
          open={this.state.dropdownOpen}
          onToggle={this.toggleDropdown}
          placement="bottom-end"
          relativePosition
          usePortal={false}
        />
      </>
    );
  }
}

export default compose(
  withRouter,
  withModules,
  injectIntl,
)(ProfileDropdown);
