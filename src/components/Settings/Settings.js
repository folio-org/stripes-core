import React, {
  useRef,
  useEffect,
  useMemo,
  Suspense,
} from 'react';
import {
  FormattedMessage,
  useIntl,
} from 'react-intl';
import { useLocation } from 'react-router';
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
import { useModules } from '../../ModulesContext';
import { stripesShape } from '../../Stripes';
import AppIcon from '../AppIcon';
import { packageName } from '../../constants';
import RouteErrorBoundary from '../RouteErrorBoundary';
import { ModuleHierarchyProvider } from '../ModuleHierarchy';
import ReleaseNotesLink from '../ReleaseNotesLink';

import css from './Settings.css';

const propTypes = {
  stripes: stripesShape.isRequired,
};

const Settings = ({ stripes }) => {
  const paneTitleRef = useRef();
  const location = useLocation();
  const modules = useModules();
  const intl = useIntl();

  useEffect(() => {
    if (paneTitleRef.current) {
      paneTitleRef.current.focus();
    }
  }, []);

  const connectedModules = useMemo(() => {
    const settingsModules = modules.settings || [];

    return settingsModules
      .filter(x => stripes.hasPerm(`settings.${x.module.replace(packageName.PACKAGE_SCOPE_REGEX, '')}.enabled`))
      .sort((x, y) => x.displayName.toLowerCase().localeCompare(y.displayName.toLowerCase()))
      .map((m) => {
        try {
          const connect = connectFor(m.module, stripes.epics, stripes.logger);
          return {
            module: m,
            Component: connect(m.getModule()),
            moduleStripes: stripes.clone({ connect }),
          };
        } catch (error) {
          console.error(error); // eslint-disable-line
          throw Error(error);
        }
      });
  }, [stripes, modules.settings]);

  const navLinks = useMemo(() => connectedModules.map(({ module }) => {
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
  }), [connectedModules]);

  const routes = useMemo(() => connectedModules.map(({ module, Component, moduleStripes }) => {
    const path = `/settings${module.route}`;
    return (
      <Route
        path={path}
        key={module.route}
        render={(props2) => (
          <RouteErrorBoundary escapeRoute={path} moduleName={module.displayName} isSettings>
            <StripesContext.Provider value={moduleStripes}>
              <ModuleHierarchyProvider module={module.module}>
                <Component {...props2} stripes={moduleStripes} showSettings actAs="settings" />
              </ModuleHierarchyProvider>
              {props2.match.isExact ? <div className={css.panePlaceholder} /> : null}
            </StripesContext.Provider>
          </RouteErrorBoundary>
        )}
      />
    );
  }), [connectedModules]);

  // To keep the top level parent menu item shown as active
  // when a child settings page is active
  const activeLink = `/settings/${location.pathname.split('/')[2]}`;

  return (
    <Suspense fallback={<LoadingView />}>
      <Paneset id="settings-module-display">
        <Pane
          defaultWidth="20%"
          paneTitle={<FormattedMessage id="stripes-core.settings" />}
          paneTitleRef={paneTitleRef.current}
          id="settings-nav-pane"
        >
          <NavList aria-label={intl.formatMessage({ id: 'stripes-core.settings' })}>
            <NavListSection
              activeLink={activeLink}
              label={intl.formatMessage({ id: 'stripes-core.settings' })}
              className={css.navListSection}
            >
              {navLinks}
            </NavListSection>
          </NavList>
          <NavList aria-label={intl.formatMessage({ id: 'stripes-core.settingSystemInfo' })}>
            <NavListSection
              label={intl.formatMessage({ id: 'stripes-core.settingSystemInfo' })}
              activeLink={activeLink}
              className={css.navListSection}
            >
              <NavListItem>
                <ReleaseNotesLink label={intl.formatMessage({ id: 'stripes-core.releaseNotes.settings' })} />
              </NavListItem>
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
};

Settings.propTypes = propTypes;

export default Settings;
