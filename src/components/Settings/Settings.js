import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import Link from 'react-router-dom/Link';
import { connectFor } from '@folio/stripes-connect';
import { modules } from 'stripes-loader'; // eslint-disable-line
import { withRouter } from 'react-router';

import AddContext from '../../AddContext';
import { stripesShape } from '../../Stripes';

import NavList from './NavList';
import NavListSection from './NavListSection';

import css from './Settings.css';

const settingsModules = [].concat(
  (modules.app || []).filter(m => m.hasSettings),
  (modules.settings || []),
);

const Settings = (props) => {
  const stripes = props.stripes;
  const navLinks = settingsModules.sort(
    (x, y) => x.displayName > y.displayName,
  ).filter(
    x => stripes.hasPerm(`settings.${x.module.replace(/^@folio\//, '')}.enabled`),
  ).map(m => (
    <Link
      key={m.route}
      to={`/settings${m.route}`}
    >
      {m.displayName}
    </Link>
  ));

  const routes = settingsModules.filter(
    x => stripes.hasPerm(`settings.${x.module.replace(/^@folio\//, '')}.enabled`),
  ).map((m) => {
    const connect = connectFor(m.module, stripes.epics, stripes.logger);
    const Current = connect(m.getModule());
    const moduleStripes = stripes.clone({ connect });

    return (<Route
      path={`/settings${m.route}`}
      key={m.route}
      render={props2 => (
        <AddContext context={{ stripes: moduleStripes }}>
          <Current {...props2} stripes={moduleStripes} showSettings />
        </AddContext>
      )}
    />);
  });

  return (
    <div className={css.paneset}>
      <div className={css.navPane} style={{ width: '20%' }}>
        <div className={css.header}>
          <span>Settings</span>
        </div>
        <div className={css.content}>
          <NavList>
            <NavListSection label="App Settings" activeLink={props.location.pathname}>
              {navLinks}
            </NavListSection>
          </NavList>
        </div>
      </div>

      <Switch>
        {routes}
        <Route component={() => <div>Choose settings</div>} />
      </Switch>
    </div>
  );
};

Settings.propTypes = {
  stripes: stripesShape.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default withRouter(Settings);
