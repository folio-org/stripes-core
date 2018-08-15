import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-router-dom/Switch';
import Route from 'react-router-dom/Route';
import { connectFor } from '@folio/stripes-connect';
import { withRouter } from 'react-router';
import NavList from '@folio/stripes-components/lib/NavList';
import NavListItem from '@folio/stripes-components/lib/NavListItem';
import NavListSection from '@folio/stripes-components/lib/NavListSection';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import { FormattedMessage } from 'react-intl';

import About from '../About';
import { StripesContext } from '../../StripesContext';
import AddContext from '../../AddContext';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';

import css from './Settings.css';

const getSettingsModules = (modules) => (
  [].concat(
    (modules.app || []).filter(m => m.hasSettings),
    (modules.settings || []),
  )
);

class Settings extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    modules: PropTypes.shape({
      app: PropTypes.array,
      settings: PropTypes.array,
    })
  };

  constructor(props) {
    super(props);

    const { stripes, modules } = props;
    const settingsModules = getSettingsModules(modules);

    this.connectedModules = settingsModules
      .filter(x => stripes.hasPerm(`settings.${x.module.replace(/^@folio\//, '')}.enabled`))
      .sort((x, y) => x.displayName.toLowerCase() > y.displayName.toLowerCase())
      .map((m) => {
        const connect = connectFor(m.module, stripes.epics, stripes.logger);
        return {
          module: m,
          Component: connect(m.getModule()),
          moduleStripes: stripes.clone({ connect }),
        };
      });
  }

  render() {
    const { stripes, location } = this.props;
    const navLinks = this.connectedModules.map(({ module }) => (
      <NavListItem
        key={module.route}
        to={`/settings${module.route}`}
      >
        {module.displayName}
      </NavListItem>
    ));

    const routes = this.connectedModules.map(({ module, Component, moduleStripes }) => {
      return (<Route
        path={`/settings${module.route}`}
        key={module.route}
        render={(props2) => (
          <StripesContext.Provider value={moduleStripes}>
            <AddContext context={{ stripes: moduleStripes }}>
              <Component {...props2} stripes={moduleStripes} showSettings />
            </AddContext>
          </StripesContext.Provider>
        )}
      />);
    });

    // To keep the top level parent menu item shown as active
    // when a child settings page is active
    const activeLink = `/settings/${location.pathname.split('/')[2]}`;

    return (
      <Paneset>
        <Pane defaultWidth="20%" paneTitle="Settings">
          <NavList>
            <NavListSection activeLink={activeLink} label="Settings" className={css.navListSection}>
              {navLinks}
            </NavListSection>
          </NavList>
          <NavListSection label="System information" activeLink={activeLink} className={css.navListSection}>
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
  }
}

export default withRouter(withModules(Settings));
