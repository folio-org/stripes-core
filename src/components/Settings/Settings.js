import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import { modules } from 'stripes-config'; // eslint-disable-line
import { withRouter } from 'react-router';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import { FormattedMessage } from 'react-intl';

import About from '../About';
import AddContext from '../../AddContext';
import { stripesShape } from '../../Stripes';

const settingsModules = [].concat(
  (modules.app || []).filter(m => m.hasSettings),
  (modules.settings || []),
);

const Settings = (props) => {
  const stripes = props.stripes;
  const navLinks = settingsModules.map(
    m => ({
      ...m,
      displayName: stripes.intl.formatMessage({
        id: m.displayName,
        defaultMessage: m.displayName,
      })
    })
  ).sort(
    (x, y) => x.displayName.toLowerCase() > y.displayName.toLowerCase(),
  ).filter(
    x => stripes.hasPerm(`settings.${x.module.replace(/^@folio\//, '')}.enabled`),
  ).map(m => (
    <NavListItem
      key={m.route}
      to={`/settings${m.route}`}
    >
      {m.displayName}
    </NavListItem>
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

  // To keep the top level parent menu item shown as active
  // when a child settings page is active
  const activeLink = `/settings/${props.location.pathname.split('/')[2]}`;

  return (
    <Paneset>
      <Pane defaultWidth="20%" paneTitle="Settings">
        <NavList>
          <NavListSection activeLink={activeLink} label="Settings">
            {navLinks}
          </NavListSection>
        </NavList>
        <br /><br />
        <NavListSection label="System information" activeLink={activeLink}>
          <NavListItem to="/settings/about"><FormattedMessage id="stripes-core.front.about" /></NavListItem>
        </NavListSection>
      </Pane>
      <Switch>
        {routes}
        <Route path="/settings/about" component={() => <About stripes={stripes} />} key="about" />
        <Route component={() => <div style={{ padding: '15px' }}>Choose settings</div>} />
      </Switch>
    </Paneset>
  );
};

Settings.propTypes = {
  stripes: stripesShape.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default withRouter(Settings);
