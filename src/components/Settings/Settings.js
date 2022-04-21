import React, { createRef, Suspense } from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { withRouter } from 'react-router';
import {
  Switch,
  Route,
} from 'react-router-dom';

import { connectFor } from '@folio/stripes-connect';

import {
  LoadingView,
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  Paneset
} from '@folio/stripes-components';

import About from '../About';
import { StripesContext } from '../../StripesContext';
import AddContext from '../../AddContext';
import { withModules } from '../Modules';
import { stripesShape } from '../../Stripes';
import AppIcon from '../AppIcon';
import { packageName } from '../../constants';
import RouteErrorBoundary from '../RouteErrorBoundary';
import { ModuleHierarchyProvider } from '../ModuleHierarchy';

import css from './Settings.css';

class Settings extends React.Component {
  static propTypes = {
    stripes: stripesShape.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
    modules: PropTypes.shape({
      app: PropTypes.arrayOf(PropTypes.object),
      settings: PropTypes.arrayOf(PropTypes.object),
    }),
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }),
  };

  constructor(props) {
    super(props);

    this.paneTitleRef = createRef();
    const { stripes, modules } = props;
    const settingsModules = modules.settings || [];

    this.connectedModules = settingsModules
      .filter(x => stripes.hasPerm(`settings.${x.module.replace(packageName.PACKAGE_SCOPE_REGEX, '')}.enabled`))
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

  componentDidMount() {
    if (this.paneTitleRef.current) {
      this.paneTitleRef.current.focus();
    }
  }

  render() {
    const { stripes, location, intl: { formatMessage } } = this.props;
    const navLinks = this.connectedModules.map(({ module }) => {
      return (
        <NavListItem
          key={module.route}
          to={`/settings${module.route}`}
        >
          <AppIcon
            alt={module.displayName}
            app={module.module}
            size="small"
            iconClassName={css.appIcon}
          >
            {module.displayName}
          </AppIcon>
        </NavListItem>
      );
    });

    const routes = this.connectedModules.map(({ module, Component, moduleStripes }) => {
      const path = `/settings${module.route}`;
      return (
        <Route
          path={path}
          key={module.route}
          render={(props2) => (
            <RouteErrorBoundary escapeRoute={path} moduleName={module.displayName} isSettings>
              <StripesContext.Provider value={moduleStripes}>
                <AddContext context={{ stripes: moduleStripes }}>
                  <ModuleHierarchyProvider module={module.module}>
                    <Component {...props2} stripes={moduleStripes} showSettings actAs="settings" />
                  </ModuleHierarchyProvider>
                </AddContext>
                {props2.match.isExact ? <div className={css.panePlaceholder} /> : null}
              </StripesContext.Provider>
            </RouteErrorBoundary>
          )}
        />
      );
    });

    // To keep the top level parent menu item shown as active
    // when a child settings page is active
    const activeLink = `/settings/${location.pathname.split('/')[2]}`;

    return (
      <Suspense fallback={<LoadingView />}>
        <Paneset id="settings-module-display">
          <Pane
            defaultWidth="20%"
            paneTitle={<FormattedMessage id="stripes-core.settings" />}
            paneTitleRef={this.paneTitleRef}
            id="settings-nav-pane"
          >
            <NavList aria-label={formatMessage({ id: 'stripes-core.settings' })}>
              <NavListSection
                activeLink={activeLink}
                label={formatMessage({ id: 'stripes-core.settings' })}
                className={css.navListSection}
              >
                {navLinks}
              </NavListSection>
            </NavList>
            <NavList aria-label={formatMessage({ id: 'stripes-core.settingSystemInfo' })}>
              <NavListSection
                label={formatMessage({ id: 'stripes-core.settingSystemInfo' })}
                activeLink={activeLink}
                className={css.navListSection}
              >
                <NavListItem to="/settings/about">
                  <FormattedMessage id="stripes-core.front.about" />
                </NavListItem>
              </NavListSection>
            </NavList>
          </Pane>
          <Switch>
            {routes}
            <Route path="/settings/about" component={() => <About stripes={stripes} />} key="about" />
            <Route component={() => <div style={{ padding: '15px' }}><FormattedMessage id="stripes-core.settingChoose" /></div>} />
          </Switch>
        </Paneset>
      </Suspense>
    );
  }
}

export default withRouter(withModules(injectIntl(Settings)));
