import React from 'react';
import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import NavGroup from './NavGroup';
import Breadcrumbs from './Breadcrumbs';

import Link from 'react-router/Link';
import { modules } from 'stripes-loader!';

if (!Array.isArray(modules.app) || modules.app.length < 1) {
  throw new Error('At least one module of type "app" must be enabled.');
}

class MainNav extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    const menuLinks = modules.app.map(entry =>
      <Link to={entry.route} key={entry.route}>{
        ({href, onClick}) =>
          <NavButton onClick={onClick} href={href} title={entry.displayName}>
            <img src="http://placehold.it/22x22/00ff00/ffffff"/>
            <span className={css.linkLabel}>
              {entry.displayName}
            </span>
          </NavButton>
      }</Link>
    );
    let firstNav, breadcrumbArray = [];
    if(breadcrumbArray.length === 0){
      firstNav = <NavGroup><NavButton href="#"><img src="http://placehold.it/22x22/ff9900/ffffff"/><span style={{fontSize: '22px'}}>FOLIO</span></NavButton></NavGroup>
    }else{ 
      firstNav =  <NavGroup>
                    <NavButton>
                      <img src="http://placehold.it/22x22/00ff00/ffffff"/>
                    </NavButton>
                    <Breadcrumbs linkArray={breadcrumbArray} />
                  </NavGroup>
     }
    return(
      <nav role="navigation" className={css.navRoot}>
        
        {firstNav}
        
        <NavGroup md="hide">
          {menuLinks}
          <NavDivider/>
          <NavButton><img src="http://placehold.it/22x22/dc0000"/></NavButton>
          <NavButton><img src="http://placehold.it/22x22/00ab00"/></NavButton>
          <NavButton><img src="http://placehold.it/22x22/0000ab"/></NavButton>
          <NavButton><img src="http://placehold.it/22x22/a0000b"/></NavButton>
          <NavDivider/>
          <NavButton><img src="http://placehold.it/22x22/dc0000"/></NavButton>
          <NavButton><img src="http://placehold.it/22x22/00ab00"/></NavButton>
        </NavGroup>
      </nav>
    );
  }
}

export default MainNav;


