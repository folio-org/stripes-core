import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';

import { useStripes } from '../../StripesContext';
import { useModules } from '../../ModulesContext';
import { LastVisitedContext } from '../LastVisited';
import usePreferences from '../../hooks/usePreferences';
import { packageName } from '../../constants';
import settingsIcon from './settings.svg';


const APPORDER_PREF_NAME = 'user-main-nav-order';
const APPORDER_PREF_SCOPE = 'stripes-core.prefs.manage';

export const AppOrderContext = createContext({
  isLoading: true,
  listOrder: [],
  apps: [],
  updateList: () => {},
  reset: () => {},
});

export const useAppOrderContext = () => {
  return useContext(AppOrderContext);
};

function getProvisionedApps(appModules, stripes, pathname, lastVisited, formatMessage) {
  const apps = appModules.map((entry) => {
    const name = entry.module.replace(packageName.PACKAGE_SCOPE_REGEX, '');
    const perm = `module.${name}.enabled`;

    if (!stripes.hasPerm(perm)) {
      return null;
    }

    const id = `clickable-${name}-module`;

    const pathRoot = pathname.split('/')[1];
    const entryRoot = entry.route.split('/')[1];
    const active = pathRoot === entryRoot;

    const last = lastVisited[name];
    const home = entry.home || entry.route;
    const href = (active || !last) ? home : lastVisited[name];

    return {
      id,
      href,
      active,
      name,
      ...entry,
    };
  }).filter(app => app);

  /**
   * Add Settings to apps array manually
   * until Settings becomes a standalone app
   */

  if (stripes.hasPerm('settings.enabled')) {
    apps.push({
      displayName: formatMessage({ id: 'stripes-core.settings' }),
      name: 'settings',
      id: 'clickable-settings',
      href: lastVisited.x_settings || '/settings',
      active: pathname.startsWith('/settings'),
      description: 'FOLIO settings',
      iconData: {
        src: settingsIcon,
        alt: 'Tenant Settings',
        title: 'Settings',
      },
      route: '/settings'
    });
  }
  return apps;
  // return sortby(apps, app => app.displayName.toLowerCase());
}

export const AppOrderProvider = ({ children }) => {
  const { lastVisited } = useContext(LastVisitedContext);
  const { app } = useModules();
  const stripes = useStripes();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const { getPreference, setPreference, removePreference } = usePreferences();

  const { data: userAppList, isLoading, refetch: refetchAppList } = useQuery(`${stripes?.user?.user?.id}-pref-query`, () => {
    return getPreference({ key: APPORDER_PREF_NAME, scope: APPORDER_PREF_SCOPE });
  });

  // returns list of apps in user-defined order. By alpha if no order defined.
  const apps = useMemo(() => {
    if (!stripes) return [];
    const platformApps = getProvisionedApps(app, stripes, pathname, lastVisited, formatMessage);

    // let orderedApps = userAppList?.value || []; // the persisted, user-preferred app order.
    let orderedApps = userAppList || []; // the persisted, user-preferred app order.
    let navList = []; // contains the ultimate reordered array of app nav items.

    // No length in the persisted apps means apps ordered by alpha (default)
    if (!orderedApps?.length) {
      // default ordered apps just contain a subset of the fields in the app object...
      orderedApps = platformApps.map(({ name }) => ({ name }));
      navList = platformApps;
    } else {
      // reorder apps to the persisted preference value...
      navList = orderedApps.map((listing) => {
        const { name: appName } = listing;
        const appIndex = platformApps.findIndex((module) => appName === module.name);

        if (appIndex !== -1) {
          return platformApps[appIndex];
        }

        return false;
      });

      // find the apps from the platform that are not saved in user-reordered list and tack them on at the end.
      // these cover permission changes/apps added... can be labeled as 'new' in the preference settings.
      platformApps.forEach((platApp) => {
        const orderedIndex = orderedApps.findIndex((oa) => oa.name === platApp.name);
        if (orderedIndex === -1) {
          orderedApps.push({
            name: platApp.name,
            isNew: true,
          });
        }
      });
    }

    return { navList, orderedApps };
  }, [formatMessage, app, lastVisited, userAppList, pathname]); // omitted: stripes, pathname

  const updateList = async (list) => {
    // clean the 'isNew' field;
    list.forEach((item) => {
      if (Object.prototype.hasOwnProperty.call(item, 'isNew')) {
        delete item.isNew;
      }
    });
    await setPreference({ key: APPORDER_PREF_NAME, scope: APPORDER_PREF_SCOPE, value: list });
    await refetchAppList();
  };

  // resetting the app order preference just removes the entry from settings.
  const reset = async () => {
    await removePreference({ key: APPORDER_PREF_NAME, scope: APPORDER_PREF_SCOPE });
    await refetchAppList();
  };

  return (
    <AppOrderContext.Provider value={{
      isLoading,
      apps: apps.navList,
      appNavOrder: apps.orderedApps,
      updateList,
      reset
    }}
    >
      {children}
    </AppOrderContext.Provider>
  );
};
