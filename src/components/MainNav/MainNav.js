import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, find } from 'lodash';
import { compose } from 'redux';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import localforage from 'localforage';

import { branding } from 'stripes-config';

import { Icon } from '@folio/stripes-components';

import { withModules } from '../Modules';
import { LastVisitedContext } from '../LastVisited';
import { clearOkapiToken, clearCurrentUser } from '../../okapiActions';
import { resetStore } from '../../mainActions';
import { getLocale } from '../../loginServices';
import {
  updateQueryResource,
  getLocationQuery,
  updateLocation,
  getCurrentModule,
  isQueryResourceModule,
  getQueryResourceState,
} from '../../locationService';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import { CurrentAppGroup } from './CurrentApp';
import ProfileDropdown from './ProfileDropdown';
import AppList from './AppList';
import { SkipLink } from './components';
import { packageName } from '../../constants';

import settingsIcon from './settings.svg';

class MainNav extends Component {
  static propTypes = {
    intl: PropTypes.object,
    stripes: PropTypes.shape({
      config: PropTypes.shape({
        showPerms: PropTypes.bool,
        helpUrl: PropTypes.string,
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
      app: PropTypes.arrayOf(PropTypes.object),
    })
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

  componentDidMount() {
    let curQuery = getLocationQuery(this.props.location);
    const prevQueryState = {};

    this._unsubscribe = this.store.subscribe(() => {
      const { history, location } = this.props;
      const module = this.curModule;
      const state = this.store.getState();

      // If user has timed out, force them to log in again.
      if (state?.okapi?.token && state.okapi.authFailure
        && find(state.okapi.authFailure, { type: 'error', code: 'user.timeout' })) {
        this.returnToLogin();
      }

      if (module && isQueryResourceModule(module, location)) {
        const { moduleName } = module;
        const queryState = getQueryResourceState(module, this.store);

        // only update location if query state has changed
        if (!isEqual(queryState, prevQueryState[moduleName])) {
          curQuery = updateLocation(module, curQuery, this.store, history, location);
          prevQueryState[moduleName] = queryState;
        }
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

  // Return the user to the login screen, but after logging in they will return to their previous activity.
  returnToLogin() {
    const { okapi } = this.store.getState();

    return getLocale(okapi.url, this.store, okapi.tenant).then(() => {
      this.store.dispatch(clearOkapiToken());
      this.store.dispatch(clearCurrentUser());
      this.store.dispatch(resetStore());
      localforage.removeItem('okapiSess');
    });
  }

  // return the user to the login screen, but after logging in they will be brought to the default screen.
  logout() {
    console.clear(); // eslint-disable-line no-console
    this.returnToLogin().then(() => {
      this.props.history.push('/');
    });
  }

  getAppList(lastVisited) {
    const { stripes, location: { pathname }, modules, intl: { formatMessage } } = this.props;

    const apps = modules.app.map((entry) => {
      const name = entry.module.replace(packageName.PACKAGE_SCOPE_REGEX, '');
      const perm = `module.${name}.enabled`;

      if (!stripes.hasPerm(perm)) {
        return null;
      }

      const id = `clickable-${name}-module`;

      const pathRoot = pathname.split('/')[1];
      const entryRoot = entry.route.split('/')[1];
      const active = pathRoot === entryRoot;

      const last = lastVisited[name];
      const home = entry.home || entry.route;
      const href = (active || !last) ? home : lastVisited[name];

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
    const { stripes, intl } = this.props;

    return (
      <LastVisitedContext.Consumer>
        {({ lastVisited }) => {
          const apps = this.getAppList(lastVisited);
          const selectedApp = apps.find(entry => entry.active);
          const helpUrl = stripes.config.helpUrl ?? 'https://docs.folio.org';

          return (
            <header className={css.navRoot} style={branding.style?.mainNav ?? {}}>
              <div className={css.startSection}>
                <SkipLink />
                <CurrentAppGroup selectedApp={selectedApp} config={stripes.config} />
              </div>
              <nav aria-label={intl.formatMessage({ id: 'stripes-core.mainnav.topLevelLabel' })} className={css.endSection}>
                <AppList
                  apps={apps}
                  selectedApp={selectedApp}
                  dropdownToggleId="app-list-dropdown-toggle"
                />
                <NavDivider md="hide" />
                <NavButton
                  aria-label="Help button"
                  data-test-item-help-button
                  href={helpUrl}
                  icon={<Icon
                    icon="question-mark"
                    size="large"
                  />}
                  id="helpButton"
                  target="_blank"
                />
                <NavDivider md="hide" />
                <ProfileDropdown
                  onLogout={this.logout}
                  stripes={stripes}
                />
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
