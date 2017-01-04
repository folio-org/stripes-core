import React from 'react';
import Link from 'react-router/Link';
import { modules } from 'stripes-loader!'; // eslint-disable-line

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';
import NavIcon from './NavIcon';

if (!Array.isArray(modules.app) || modules.app.length < 1) {
  throw new Error('At least one module of type "app" must be enabled.');
}

class MainNav extends React.Component {

  render() {
    const menuLinks = modules.app.map(entry =>
      <Link to={entry.route} key={entry.route}>
        {
          ({ href, onClick }) =>
            <NavButton onClick={onClick} href={href} title={entry.displayName}>
              <NavIcon color="#61f160" />
              <span className={css.linkLabel}>
                {entry.displayName}
              </span>
            </NavButton>
        }
      </Link>,
    );

    let firstNav;
    let breadcrumbArray = [];

    if (breadcrumbArray.length === 0) {
      firstNav = (
        <NavGroup md="hide">
          <NavButton href="#">
            <NavIcon color="#fdae35" />
            <span className={css.brandingLabel} style={{ fontSize: '22px' }}>FOLIO</span>
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
          {menuLinks}
          <NavDivider md="hide" />
          <NavButton md="hide" ><NavIcon color="#7eb970" /></NavButton>
          <NavButton md="hide"><NavIcon color="#b33f3f" /></NavButton>
          <NavButton md="hide"><NavIcon color="#3fb38e" /></NavButton>
          <NavButton md="hide"><NavIcon color="#3f6cb3" /></NavButton>
          <NavDivider md="hide" />
          <NavButton md="hide"><NavIcon color="#7d3fb3" /></NavButton>
          <NavButton md="hide"><NavIcon color="#b33f94" /></NavButton>
        </NavGroup>
      </nav>
    );
  }
}

export default MainNav;
