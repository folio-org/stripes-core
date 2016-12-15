import React from 'react';
import Link from 'react-router/Link';
import { modules } from 'stripes-loader!'; // eslint-disable-line

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';

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
              <img src="http://placehold.it/22x22/00ff00/ffffff" role="presentation" />
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
        <NavGroup >
          <NavButton href="#" md="hide">
            <img src="http://placehold.it/22x22/ff9900/ffffff" role="presentation" />
            <span className={css.brandingLabel} style={{ fontSize: '22px' }}>FOLIO</span>
          </NavButton>
        </NavGroup>
      );
    } else {
      firstNav = (
        <NavGroup>
          <NavButton md="hide">
            <img src="http://placehold.it/22x22/00ff00/ffffff" role="presentation" />
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
          <NavButton md="hide" ><img src="http://placehold.it/22x22/dc0000" role="presentation" /></NavButton>
          <NavButton md="hide"><img src="http://placehold.it/22x22/00ab00" role="presentation" /></NavButton>
          <NavButton md="hide"><img src="http://placehold.it/22x22/0000ab" role="presentation" /></NavButton>
          <NavButton md="hide"><img src="http://placehold.it/22x22/a0000b" role="presentation" /></NavButton>
          <NavDivider md="hide" />
          <NavButton md="hide"><img src="http://placehold.it/22x22/dc0000" role="presentation" /></NavButton>
          <NavButton md="hide"><img src="http://placehold.it/22x22/00ab00" role="presentation" /></NavButton>
        </NavGroup>
      </nav>
    );
  }
}

export default MainNav;
