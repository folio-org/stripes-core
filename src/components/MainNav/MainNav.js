import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { FormattedMessage } from 'react-intl';
import Headline from '@folio/stripes-components/lib/Headline';
import { Dropdown } from '@folio/stripes-components/lib/Dropdown'; // eslint-disable-line
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
import MyProfile from './MyProfile';
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

  constructor(props) {
    super(props);
    this.state = {
      userMenuOpen: false,
    };
    this.store = props.stripes.store;
    this.logout = this.logout.bind(this);
    this.lastVisited = {};
    this.moduleList = props.modules.app.concat({
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

  render() {
    const { stripes, location: { pathname }, modules } = this.props;
    const formatMsg = stripes.intl.formatMessage;

    // Temporary until settings becomes an app
    const settingsIconData = {
      src: settingsIcon,
      alt: 'Tenant Settings',
      title: formatMsg({ id: 'stripes-core.settings' }),
    };

    // const stripesApps = modules.app;
    const selectedApp = modules.app.find(entry => pathname.startsWith(entry.route));
    const menuLinks = modules.app.map((entry) => {
      const name = entry.module.replace(/^@[a-z0-9_]+\//, '');
      const perm = `module.${name}.enabled`;

      if (!stripes.hasPerm(perm)) {
        return null;
      }

      const navId = `clickable-${name}-module`;
      const isActive = pathname.startsWith(entry.route);
      const href = !isActive ? (this.lastVisited[name] || entry.home || entry.route) : null;

      return (
        <NavButton
          label={entry.displayName}
          id={navId}
          selected={isActive}
          href={href}
          title={entry.displayName}
          key={entry.route}
          iconKey={name}
        />);
    });

    let firstNav;
    let breadcrumbArray = []; // eslint-disable-line

    // Temporary solution until Settings becomes a standalone app
    let settingsApp;
    const settingsMsg = formatMsg({ id: 'stripes-core.settings' });
    if (stripes.hasPerm('settings.enabled') && pathname.startsWith('/settings')) {
      settingsApp = { displayName: settingsMsg, description: formatMsg({ id: 'stripes-core.folioSettings' }) };
    }

    if (breadcrumbArray.length === 0) {
      firstNav = (
        <NavGroup md="hide">
          <a className={css.skipLink} href="#ModuleContainer" aria-label="Skip Main Navigation" title="Skip Main Navigation">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
              <polygon style={{ fill: '#999' }} points="13 16.5 1.2 5.3 3.2 3.1 13 12.4 22.8 3.1 24.8 5.3 " />
              <polygon style={{ fill: '#999' }} points="13 24.8 1.2 13.5 3.2 11.3 13 20.6 22.8 11.3 24.8 13.5 " />
            </svg>
          </a>
          <CurrentApp
            id="ModuleMainHeading"
            currentApp={selectedApp || settingsApp}
            iconData={settingsApp && settingsIconData}
          />
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
      <header className={css.navRoot}>
        {firstNav}
        <nav>
          <Headline tag="h2" className="sr-only">
            <FormattedMessage id="stripes-core.mainNavigation" />
          </Headline>
          <NavGroup>
            <NavGroup>
              {menuLinks}
              {
                !stripes.hasPerm('settings.enabled') ? '' : (
                  <NavButton
                    label={settingsMsg}
                    id="clickable-settings"
                    title={settingsMsg}
                    iconData={settingsIconData}
                    selected={pathname.startsWith('/settings')}
                    href={pathname.startsWith('/settings') ? null : (this.lastVisited.x_settings || '/settings')}
                  />
                )
              }
            </NavGroup>
            <NavGroup className={css.smallAlignRight}>
              <NavDivider md="hide" />
              {this.props.stripes.withOkapi && this.props.stripes.hasPerm('notify.item.get,notify.item.put,notify.collection.get') && <NotificationsDropdown stripes={stripes} {...this.props} />}
              { /* temporary divider solution.. */}
              {this.props.stripes.hasPerm('notify.item.get,notify.item.put,notify.collection.get') && (<NavDivider md="hide" />)}
              <MyProfile
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
