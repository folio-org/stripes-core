import React, { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { useIntl } from 'react-intl';
import { useLocation, useHistory } from 'react-router-dom';
import { useQueryClient } from 'react-query';

import { branding } from 'stripes-config';
import { Icon } from '@folio/stripes-components';
import {
  updateQueryResource,
  getLocationQuery,
  updateLocation,
  getCurrentModule,
  isQueryResourceModule,
  getQueryResourceState,
} from '../../locationService';

import css from './MainNav.css';
import NavButton from './NavButton';
import NavDivider from './NavDivider';
import { CurrentAppGroup } from './CurrentApp';
import ProfileDropdown from './ProfileDropdown';
import AppList from './AppList';
import { SkipLink } from './components';

import { useAppOrderContext } from './AppOrderProvider';

import { useStripes } from '../../StripesContext';
import { useModules } from '../../ModulesContext';

const MainNav = () => {
  const {
    apps,
  } = useAppOrderContext();
  const queryClient = useQueryClient();
  const stripes = useStripes();
  const location = useLocation();
  const modules = useModules();
  const history = useHistory();
  const intl = useIntl();

  const [curModule, setCurModule] = useState(getCurrentModule(modules, location));
  const [selectedApp, setSelectedApp] = useState(apps.find(entry => entry.active));
  const helpUrl = useRef(stripes.config.helpUrl ?? 'https://docs.folio.org').current;

  useEffect(() => {
    let curQuery = getLocationQuery(location);
    const prevQueryState = {};

    const { store } = stripes;
    const _unsubscribe = store.subscribe(() => {
      const module = curModule;

      if (module && isQueryResourceModule(module, location)) {
        const { moduleName } = module;
        const queryState = getQueryResourceState(module, stripes.store);

        // only update location if query state has changed
        if (!isEqual(queryState, prevQueryState[moduleName])) {
          curQuery = updateLocation(module, curQuery, stripes.store, history, location);
          prevQueryState[moduleName] = queryState;
        }
      }
    });

    // remove QueryProvider cache to be 100% sure we're starting from a clean slate.
    queryClient.removeQueries();

    return () => {
      _unsubscribe();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    setSelectedApp(apps.find(entry => entry.active));
    const nextCurModule = getCurrentModule(modules, location);
    if (nextCurModule) {
      setCurModule(getCurrentModule(modules, location));
      updateQueryResource(location, nextCurModule, stripes.store);
    }
  }, [modules, location, stripes.store, apps]);

  return (
    <header className={css.navRoot} style={branding?.style?.mainNav ?? {}}>
      <div className={css.startSection}>
        <SkipLink />
        <CurrentAppGroup selectedApp={selectedApp} config={stripes.config} />
      </div>
      <nav aria-label={intl.formatMessage({ id: 'stripes-core.mainnav.topLevelLabel' })} className={css.endSection}>
        <AppList
          apps={apps}
          selectedApp={selectedApp}
          dropdownToggleId="app-list-dropdown-toggle"
        />
        <NavDivider md="hide" />
        <NavButton
          aria-label="Help button"
          data-test-item-help-button
          href={helpUrl}
          icon={<Icon
            icon="question-mark"
            size="large"
          />}
          id="helpButton"
          target="_blank"
        />
        <NavDivider md="hide" />
        <ProfileDropdown stripes={stripes} />
      </nav>
    </header>
  );
};

export default MainNav;
