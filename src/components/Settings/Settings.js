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
    const settingsModules = modules.settings || [];

    this.connectedModules = settingsModules
      .filter(x => stripes.hasPerm(`settings.${x.module.replace(/^@folio\//, '')}.enabled`))
      .sort((x, y) => x.displayName.toLowerCase().localeCompare(y.displayName.toLowerCase()))
      .map((m) => {
        try {
          const connect = connectFor(m.module, stripes.epics, stripes.logger);
          const module = m.getModule();

          return {
            module: m,
            Component: connect(module),
            moduleStripes: stripes.clone({ connect }),
          };
        } catch (error) {
          console.error(error); // eslint-disable-line
          throw Error(error);
        }
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
              <Component {...props2} stripes={moduleStripes} showSettings actAs="settings" />
            </AddContext>
            {props2.match.isExact ? <div className={css.panePlaceholder} /> : null}
          </StripesContext.Provider>
        )}
      />);
    });

    // To keep the top level parent menu item shown as active
    // when a child settings page is active
    const activeLink = `/settings/${location.pathname.split('/')[2]}`;

    return (
      <Paneset>
        <Pane
          defaultWidth="20%"
          paneTitle={<FormattedMessage id="stripes-core.settings" />}
        >
          <FormattedMessage id="stripes-core.settings">
            { label => (
              <NavList ariaLabel={label}>
                <NavListSection
                  activeLink={activeLink}
                  label={label}
                  className={css.navListSection}
                >
                  {navLinks}
                </NavListSection>
              </NavList>
            )}
          </FormattedMessage>
          <FormattedMessage id="stripes-core.settingSystemInfo">
            {label => (
              <NavList aria-label={label}>
                <NavListSection
                  label={label}
                  activeLink={activeLink}
                  className={css.navListSection}
                >
                  <NavListItem to="/settings/about">
                    <FormattedMessage id="stripes-core.front.about" />
                  </NavListItem>
                </NavListSection>
              </NavList>
            )}
          </FormattedMessage>
        </Pane>
        <Switch>
          {routes}
          <Route path="/settings/about" component={() => <About stripes={stripes} />} key="about" />
          <Route component={() => <div style={{ padding: '15px' }}><FormattedMessage id="stripes-core.settingChoose" /></div>} />
        </Switch>
      </Paneset>
    );
  }
}

export default withRouter(withModules(Settings));
