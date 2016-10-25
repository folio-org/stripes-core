import React from 'react';
import { Navbar, NavbarBrand, Nav, NavItem } from 'react-bootstrap';
import Link from 'react-router/Link';
import { modules } from 'stripes-loader!';

if (!Array.isArray(modules.app) || modules.app.length < 1) {
  throw new Error('At least one module of type "app" must be enabled.');
}

export const Menu = () => {
  const menuLinks = modules.app.map(entry =>
    <Link to={entry.route} key={entry.route}>{
      ({ href, onClick }) =>
        <NavItem onClick={onClick} href={href}>{entry.displayName}</NavItem>
    }</Link>
  );
  return (
    <Navbar fixedTop>
      <NavbarBrand>
        <Link to="/">FOLIO!</Link>
      </NavbarBrand>
      <Navbar.Collapse>
        <Nav navbar>
          {menuLinks}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Menu;
