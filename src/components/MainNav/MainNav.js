import React, { Component } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import _ from 'lodash';

import { Dropdown } from '@folio/stripes-components/lib/Dropdown'; // eslint-disable-line
import { withRouter } from 'react-router';
import localforage from 'localforage';

import { modules } from 'stripes-config'; // eslint-disable-line

import { clearOkapiToken, clearCurrentUser } from '../../okapiActions';
import { resetStore } from '../../mainActions';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';
import NavIcon from './NavIcon';
import CurrentApp from './CurrentApp';
import MyProfile from './MyProfile';
import NotificationsDropdown from './Notifications/NotificationsDropdown';

import NavDropdownMenu from './NavDropdownMenu';

if (!Array.isArray(modules.app) || modules.app.length < 1) {
  throw new Error('At least one module of type "app" must be enabled.');
}

class MainNav extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
      }),
      store: PropTypes.shape({
        dispatch: PropTypes.func.isRequired,
      }),
      hasPerm: PropTypes.func.isRequired,
    }),
    history: PropTypes.shape({
      listen: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      userMenuOpen: false,
    };
    this.store = props.stripes.store;
    this.logout = this.logout.bind(this);
    this.lastVisited = {};
    this.queryValues = null;

    this.moduleList = modules.app.concat({
      route: '/settings',
      module: '@folio/x_settings',
    });

    props.history.listen((hist) => {
      for (const entry of this.moduleList) {
        if (hist.pathname === entry.route || hist.pathname.startsWith(`${entry.route}/`)) {
          const name = entry.module.replace(/^@folio\//, '');
          this.lastVisited[name] = `${hist.pathname}${hist.search}`;
        }
      }
    });
  }

  componentDidUpdate() {
    for (const entry of this.moduleList) {
      if (this.props.location.pathname.startsWith(entry.route)) {
        const name = entry.module.replace(/^@folio\//, '');
        if (this.moduleName !== name) {
          if (this.unsubscribe) {
            this.unsubscribe();
          }
          if (entry.queryResource) {
            this.unsubscribe = this.subscribeToQueryChanges(entry);
          }
          this.moduleName = name;
        }
      }
    }
  }

  toggleUserMenu() {
    const isOpen = this.state.userMenuOpen;
    this.setState({
      userMenuOpen: !isOpen,
    });
  }

  logout() {
    this.store.dispatch(clearOkapiToken());
    this.store.dispatch(clearCurrentUser());
    this.store.dispatch(resetStore());
    localforage.removeItem('okapiSess');
    this.context.router.history.push('/');
  }

  subscribeToQueryChanges(moduleInfo) {
    return this.store.subscribe(() => {
      const previousQueryValues = this.queryValues;
      // This is not DRY, as it was expressed already in LocalResource is stripes-connect,
      // And in Root.js in stripes-core. Both State Keys should be derived from a common mechanism.
      this.queryValues = this.store.getState()[`${moduleInfo.dataKey ? `${moduleInfo.dataKey}#` : ''}${_.snakeCase(moduleInfo.module)}_${moduleInfo.queryResource}`];
      if (previousQueryValues !== this.queryValues) {
        // This is not DRY, as it was expressed already in utils/transitionToParams is stripes-connect,
        // It is changed slightly, but I did not want to make changes to a method that is being used elswhere.
        const location = this.props.location;
        const query = location.query ? location.query : queryString.parse(location.search);
        const allParams = Object.assign({}, query, this.queryValues);
        let url = allParams._path || location.pathname;
        delete allParams._path;

        const nonNull = Object.keys(allParams).filter(k => allParams[k] != null).reduce((r, k) => Object.assign(r, { [k]: allParams[k] }), {});
        if (Object.keys(nonNull).length) {
          url += `?${queryString.stringify(nonNull)}`;
        }
        this.props.history.replace(url);
      }
    });
  }

  render() {
    const { stripes, location: { pathname } } = this.props;
    const selectedApp = modules.app.find(entry => pathname.startsWith(entry.route));

    const menuLinks = modules.app.map((entry) => {
      const name = entry.module.replace(/^@[a-z0-9_]+\//, '');
      const perm = `module.${name}.enabled`;
      const navId = `clickable-${name}-module`;

      if (!stripes.hasPerm(perm)) return null;

      return (
        <NavButton
          label={entry.displayName}
          id={navId}
          selected={pathname.startsWith(entry.route)}
          onClick={this.handleNavigation(entry)}
          href={this.lastVisited[name] || entry.home || entry.route}
          title={entry.displayName}
          key={entry.route}
        />);
    });

    let firstNav;
    let breadcrumbArray = []; // eslint-disable-line

    if (breadcrumbArray.length === 0) {
      firstNav = (
        <NavGroup md="hide">
          <a className={css.skipLink} href="#ModuleContainer" aria-label="Skip Main Navigation" title="Skip Main Navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
              <polygon style={{ fill: '#999' }} points="13 16.5 1.2 5.3 3.2 3.1 13 12.4 22.8 3.1 24.8 5.3 " />
              <polygon style={{ fill: '#999' }} points="13 24.8 1.2 13.5 3.2 11.3 13 20.6 22.8 11.3 24.8 13.5 " />
            </svg>
          </a>
          {selectedApp &&
            <CurrentApp
              currentApp={selectedApp}
            />
          }
          {
            stripes.hasPerm('settings.enabled') && pathname.startsWith('/settings') &&
            <NavButton label="Settings" href={this.lastVisited.x_settings || '/settings'} />
          }
        </NavGroup>
      );
    } else {
      firstNav = (
        <NavGroup>
          <NavButton md="hide" />
          <Breadcrumbs linkArray={breadcrumbArray} />
        </NavGroup>
      );
    }

    return (
      <nav className={css.navRoot}>
        {firstNav}
        <NavGroup>
          <NavGroup>
            {menuLinks}
            {
              !stripes.hasPerm('settings.enabled') ? '' : (
                <NavButton
                  label="Settings"
                  id="clickable-settings"
                  selected={pathname.startsWith('/settings')}
                  href={this.lastVisited.x_settings || '/settings'}
                />
              )
            }
          </NavGroup>
          <NavGroup className={css.smallAlignRight}>
            <NavDivider md="hide" />
            { this.props.stripes.hasPerm('notify.item.get,notify.item.put,notify.collection.get') && (<NotificationsDropdown stripes={stripes} {...this.props} />) }
            { /* temporary divider solution.. */ }
            { this.props.stripes.hasPerm('notify.item.get,notify.item.put,notify.collection.get') && (<NavDivider md="hide" />) }
            <MyProfile
              onLogout={this.logout}
              stripes={stripes}
            />
          </NavGroup>
        </NavGroup>
      </nav>
    );
  }
}

export default withRouter(MainNav);
