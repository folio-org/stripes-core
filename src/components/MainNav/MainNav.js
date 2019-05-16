import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { compose } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { withRouter } from 'react-router';
import localforage from 'localforage';

import { withModules } from '../Modules';
import { LastVisitedContext } from '../LastVisited';
import { clearOkapiToken, clearCurrentUser } from '../../okapiActions';
import { resetStore } from '../../mainActions';
import {
  updateQueryResource,
  getLocationQuery,
  updateLocation,
  getCurrentModule,
  isQueryResourceModule
} from '../../locationService';

import css from './MainNav.css';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import { CurrentAppGroup } from './CurrentApp';
import LocaleDropdown from './LocaleDropdown';
import ProfileDropdown from './ProfileDropdown';
import AppList from './AppList';

import settingsIcon from './settings.svg';

class MainNav extends Component {
  static propTypes = {
    intl: intlShape,
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
      }),
      store: PropTypes.shape({
        dispatch: PropTypes.func.isRequired,
      }),
      hasPerm: PropTypes.func.isRequired,
      withOkapi: PropTypes.bool,
    }),
    history: PropTypes.shape({
      listen: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired,
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    modules: PropTypes.shape({
      app: PropTypes.array,
    })
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static childContextTypes = {
    // It seems wrong that we have to tell this generic component what specific properties to put in the context
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      userMenuOpen: false,
    };
    this.store = props.stripes.store;
    this.logout = this.logout.bind(this);
    this.getAppList = this.getAppList.bind(this);
  }

  getChildContext() {
    return {
      stripes: this.props.stripes,
    };
  }

  componentDidMount() {
    let curQuery = getLocationQuery(this.props.location);
    this._unsubscribe = this.store.subscribe(() => {
      const { history, location } = this.props;
      const module = this.curModule;
      if (module && isQueryResourceModule(module, location)) {
        curQuery = updateLocation(module, curQuery, this.store, history, location);
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { modules, location } = this.props;
    this.curModule = getCurrentModule(modules, location);
    if (this.curModule && !isEqual(location, prevProps.location)) {
      updateQueryResource(location, this.curModule, this.store);
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
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
    this.props.history.push('/');
  }

  getAppList(lastVisited) {
    const { stripes, location: { pathname }, modules, intl: { formatMessage } } = this.props;

    const apps = modules.app.map((entry) => {
      const name = entry.module.replace(/^@[a-z0-9_]+\//, '');
      const perm = `module.${name}.enabled`;

      if (!stripes.hasPerm(perm)) {
        return null;
      }

      const id = `clickable-${name}-module`;

      const pathRoot = pathname.split('/')[1];
      const entryRoot = entry.route.split('/')[1];
      const active = pathRoot === entryRoot;

      const href = lastVisited[name] || entry.home || entry.route;

      return {
        id,
        href,
        active,
        name,
        ...entry,
      };
    }).filter(app => app);

    /**
     * Add Settings to apps array manually
     * until Settings becomes a standalone app
     */

    if (stripes.hasPerm('settings.enabled')) {
      apps.push({
        displayName: formatMessage({ id: 'stripes-core.settings' }),
        id: 'clickable-settings',
        href: lastVisited.x_settings || '/settings',
        active: pathname.startsWith('/settings'),
        description: 'FOLIO settings',
        iconData: {
          src: settingsIcon,
          alt: 'Tenant Settings',
          title: 'Settings',
        },
        route: '/settings'
      });
    }

    return apps;
  }

  render() {
    const { stripes } = this.props;

    return (
      <LastVisitedContext.Consumer>
        {({ lastVisited }) => {
          const apps = this.getAppList(lastVisited);
          const selectedApp = apps.find(entry => entry.active);

          return (
            <header className={css.navRoot}>
              <NavGroup>
                <a className={css.skipLink} href="#ModuleContainer" aria-label="Skip Main Navigation">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
                    <polygon style={{ fill: '#999' }} points="13 16.5 1.2 5.3 3.2 3.1 13 12.4 22.8 3.1 24.8 5.3 " />
                    <polygon style={{ fill: '#999' }} points="13 24.8 1.2 13.5 3.2 11.3 13 20.6 22.8 11.3 24.8 13.5 " />
                  </svg>
                </a>
                <CurrentAppGroup selectedApp={selectedApp} />
              </NavGroup>
              <nav aria-labelledby="main_navigation_label">
                <h2 className="sr-only" id="main_navigation_label">
                  <FormattedMessage id="stripes-core.mainnav.topLevelLabel" />
                </h2>
                <NavGroup>
                  <NavDivider md="hide" />
                  <AppList
                    apps={apps}
                    selectedApp={selectedApp}
                    dropdownToggleId="app-list-dropdown-toggle"
                  />
                  <NavDivider md="hide" />
                  <LocaleDropdown
                    stripes={stripes}
                  />
                  <NavDivider md="hide" />
                  <ProfileDropdown
                    onLogout={this.logout}
                    stripes={stripes}
                  />
                </NavGroup>
              </nav>
            </header>
          );
        }}
      </LastVisitedContext.Consumer>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  withModules,
)(MainNav);
