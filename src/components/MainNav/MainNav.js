import React, { Component, PropTypes } from 'react';
import { Dropdown } from 'react-bootstrap';
import { withRouter } from 'react-router';

import { modules } from 'stripes-loader'; // eslint-disable-line

import { clearOkapiToken, clearCurrentUser } from '../../okapiActions';
import { resetStore } from '../../mainActions';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';
import NavIcon from './NavIcon';

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
    }),
    history: React.PropTypes.shape({
      listen: React.PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      userMenuOpen: false,
    };
    this.store = props.stripes.store;
    this.toggleUserMenu = this.toggleUserMenu.bind(this);
    this.logout = this.logout.bind(this);
    this.lastVisited = {};

    const moduleList = modules.app.concat({
      route: '/settings',
      module: '@folio/x_settings',
    });

    props.history.listen((hist) => {
      for (const entry of moduleList) {
        if (hist.pathname === entry.route || hist.pathname.startsWith(`${entry.route}/`)) {
          const name = entry.module.replace(/^@folio\//, '');
          this.lastVisited[name] = `${hist.pathname}${hist.search}`;
        }
      }
    });
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
    this.context.router.history.push('/');
  }

  render() {
    const { stripes } = this.props;
    const currentUser = stripes.user ? stripes.user.user : undefined;
    const currentPerms = stripes.user ? stripes.user.perms : undefined;

    const userIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 26 26">
        <rect width="26" height="26" style={{ fill: '#3D9964' }} />
        <path d="M1.1 24.9c0 0 0-2.6 0.8-3.7 0.8-1 5.8-5.2 11.1-5.1s9.9 3.1 10.9 4.4 1.1 4.4 1.1 4.4L1.1 24.9z" style={{ fill: '#FFF' }} />
        <path d="M18.6 11.4c0 4.2-2.5 7.6-5.6 7.6 -3.1 0-5.6-3.4-5.6-7.6S8.4 3.8 13 3.8 18.6 7.2 18.6 11.4z" style={{ fill: '#FFF' }} />
        <path d="M13 19.5c-3.4 0-6.1-3.6-6.1-8.1 0-3.5 0.6-8.1 6.1-8.1 5.5 0 6.1 4.6 6.1 8.1C19.1 15.9 16.4 19.5 13 19.5zM13 4.3c-3.6 0-5.1 2.1-5.1 7.1 0 3.9 2.3 7.1 5.1 7.1 2.8 0 5.1-3.2 5.1-7.1C18.1 6.5 16.6 4.3 13 4.3z" style={{ fill: '#3D9964' }} />
      </svg>
    );
    let maybePerms;
    const config = stripes.config;
    if (config && config.showPerms) {
      maybePerms = (<span>
        <li className={css.ddDivider} aria-hidden="true" />
        <li className={css.ddTextItem}><strong>Locale:</strong> {stripes.locale}</li>
        <li className={css.ddDivider} aria-hidden="true" />
        <li className={css.ddTextItem}><strong>Perms:</strong> {Object.keys(currentPerms || {}).sort().join(', ')}</li>
      </span>);
    }

    const userDD = (
      <ul>
        <li className={`${css.nowrap} ${css.ddTextItem}`}>Logged in as <strong>{ currentUser != null ? `${currentUser.firstName} ${currentUser.lastName}` : null }</strong></li>
        <li className={css.ddDivider} aria-hidden="true" />
        <li><button id="button-logout" className={css.ddButton} type="button" onClick={this.logout}><span>Log out</span></button></li>
        {maybePerms}
      </ul>
    );

    const menuLinks = modules.app.map((entry) => {
      const name = entry.module.replace(/^@folio\//, '');
      const perm = `module.${name}.enabled`;
      if (!stripes.hasPerm(perm)) return null;

      return (<NavButton href={this.lastVisited[name] || entry.home || entry.route} title={entry.displayName} key={entry.route}>
        <NavIcon color="#61f160" />
        <span className={css.linkLabel}>
          {entry.displayName}
        </span>
      </NavButton>);
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
          <NavButton href="/">
            <NavIcon color="#fdae35" />
            <span className={css.brandingLabel} style={{ fontSize: '22px', lineHeight: '1rem' }}>FOLIO</span>
          </NavButton>
          <NavButton href={this.lastVisited.x_settings || '/settings'}>
            <NavIcon color="#7d3fb3" />
            <span>Settings</span>
          </NavButton>
        </NavGroup>
      );
    } else {
      firstNav = (
        <NavGroup>
          <NavButton md="hide">
            <NavIcon color="#fdae35" />
          </NavButton>
          <Breadcrumbs linkArray={breadcrumbArray} />
        </NavGroup>
      );
    }

    return (
      <nav role="navigation" className={css.navRoot}>
        {firstNav}
        <NavGroup>
          <NavGroup>
            {menuLinks}
            <NavDivider md="hide" />
            <NavButton md="hide" ><NavIcon color="#7eb970" /></NavButton>
            <NavButton md="hide"><NavIcon color="#b33f3f" /></NavButton>
            <NavButton md="hide"><NavIcon color="#3fb38e" /></NavButton>
            <NavButton md="hide"><NavIcon color="#3f6cb3" /></NavButton>
            <NavDivider md="hide" />
            <NavButton md="hide"><NavIcon color="#7d3fb3" /></NavButton>
          </NavGroup>
          <NavGroup className={css.smallAlignRight}>
            <Dropdown open={this.state.userMenuOpen} id="UserMenuDropDown" onToggle={this.toggleUserMenu} pullRight >
              <NavButton bsRole="toggle" title="User Menu" aria-haspopup="true" aria-expanded={this.state.userMenuOpen}><NavIcon icon={userIcon} /></NavButton>
              <NavDropdownMenu bsRole="menu" onToggle={this.toggleUserMenu} aria-label="User Menu">{userDD}</NavDropdownMenu>
            </Dropdown>
          </NavGroup>
        </NavGroup>
      </nav>
    );
  }
}

export default withRouter(MainNav);
