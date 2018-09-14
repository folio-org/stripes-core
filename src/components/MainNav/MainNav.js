import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';
import Headline from '@folio/stripes-components/lib/Headline';
import Layout from '@folio/stripes-components/lib/Layout';
import { withRouter } from 'react-router';
import localforage from 'localforage';

import { withModules } from '../Modules';
import { clearOkapiToken, clearCurrentUser } from '../../okapiActions';
import { resetStore } from '../../mainActions';
import { updateQueryResource, updateLocation, getCurrentModule, isQueryResourceModule } from '../../locationService';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';
import CurrentApp from './CurrentApp';
import ProfileDropdown from './ProfileDropdown';
import AppList from './AppList';
import NotificationsDropdown from './Notifications/NotificationsDropdown';
import settingsIcon from './settings.svg';

class MainNav extends Component {
  static propTypes = {
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
    this.lastVisited = {};
    this.moduleList = props.modules.app.concat({
      route: '/settings',
      module: '@folio/x_settings',
    });

    this.apps = this.getAppList();

    props.history.listen((hist) => {
      for (const entry of this.moduleList) {
        if (hist.pathname === entry.route || hist.pathname.startsWith(`${entry.route}/`)) {
          const name = entry.module.replace(/^@folio\//, '');
          this.lastVisited[name] = `${hist.pathname}${hist.search}`;
        }
      }
    });
  }

  getChildContext() {
    return {
      stripes: this.props.stripes,
    };
  }

  componentDidMount() {
    let curQuery = null;
    this.store.subscribe(() => {
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

  getAppList() {
    const { stripes, location: { pathname }, modules } = this.props;
    const formatMsg = stripes.intl.formatMessage;

    const apps = modules.app.map((entry) => {
      const name = entry.module.replace(/^@[a-z0-9_]+\//, '');
      const perm = `module.${name}.enabled`;

      if (!stripes.hasPerm(perm)) {
        return null;
      }

      const id = `clickable-${name}-module`;
      const active = pathname.startsWith(entry.route);
      const href = !active ? (this.lastVisited[name] || entry.home || entry.route) : null;

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
        displayName: formatMsg({ id: 'stripes-core.settings' }),
        id: 'clickable-settings',
        href: this.lastVisited.x_settings || '/settings',
        active: pathname.startsWith('/settings'),
        description: 'FOLIO settings',
        iconData: {
          src: settingsIcon,
          alt: 'Tenant Settings',
          title: 'Settings',
        },
      });
    }

    return apps;
  }

  notificationsDropdown() {
    const { stripes } = this.props;

    if (!stripes.withOkapi || !stripes.hasPerm('notify.item.get,notify.item.put,notify.collection.get')) {
      return null;
    }

    return (
      <Layout className="display-flex flex-align-items-center">
        <NotificationsDropdown stripes={stripes} {...this.props} />
        <NavDivider md="hide" />
      </Layout>
    );
  }

  render() {
    const { stripes } = this.props;

    const apps = this.getAppList();
    const selectedApp = apps.find(app => app.active);

    return (
      <header className={css.navRoot}>
        <NavGroup>
          <a className={css.skipLink} href="#ModuleContainer" aria-label="Skip Main Navigation" title="Skip Main Navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
              <polygon style={{ fill: '#999' }} points="13 16.5 1.2 5.3 3.2 3.1 13 12.4 22.8 3.1 24.8 5.3 " />
              <polygon style={{ fill: '#999' }} points="13 24.8 1.2 13.5 3.2 11.3 13 20.6 22.8 11.3 24.8 13.5 " />
            </svg>
          </a>
          <CurrentApp
            id="ModuleMainHeading"
            currentApp={selectedApp}
          />
        </NavGroup>
        <nav>
          <Headline tag="h2" className="sr-only">
            <FormattedMessage id="stripes-core.mainNavigation" />
          </Headline>
          <NavGroup>
            <NavGroup>
              <AppList
                apps={apps}
                searchfieldId="app-list-search-field"
                dropdownToggleId="app-list-dropdown-toggle"
              />
            </NavGroup>
            <NavGroup>
              <NavDivider md="hide" />
              { this.notificationsDropdown() }
              <ProfileDropdown
                onLogout={this.logout}
                stripes={stripes}
              />
            </NavGroup>
          </NavGroup>
        </nav>
      </header>
    );
  }
}

export default withRouter(withModules(MainNav));
