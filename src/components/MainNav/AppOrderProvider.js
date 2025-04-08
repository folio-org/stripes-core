import { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import sortBy from 'lodash/sortBy';

import { useStripes } from '../../StripesContext';
import { useModules } from '../../ModulesContext';
import { LastVisitedContext } from '../LastVisited';
import usePreferences from '../../hooks/usePreferences';
import { packageName } from '../../constants';
import settingsIcon from './settings.svg';


const APPORDER_PREF_NAME = 'user-main-nav-order';
const APPORDER_PREF_SCOPE = 'stripes-core.prefs.manage';

const SETTINGS_ROUTE = '/settings';

/**
 * AppOrderContext - wraps the main navigation components and the module view, passing its
 * value object to both.
 */
export const AppOrderContext = createContext({
  /**
   * whether or not the persisted preference request is in progress.
  */
  isLoading: true,
  /**
   *  Persisted array of app objects for re-ordering - the user-preferred app order.
   *  The objects in the array have the shape:
   *  { name: string - the module package name, sans scope and `ui-` prefix }
   */
  listOrder: [],
  /**
   * list of app link information ordered by user preference, falling back to the order from stripes-config.
  */
  apps: [],
  /**
   * Function to update the preference. Accepts an list of objects with shape:
   * { name: string - the module package name, sans scope and `ui-` prefix }
   */
  updateList: () => {},
  /**
   * Function to delete any the app order preference and reset the list.
  */
  reset: () => {},
});

// hook for AppOrderContext consumption.
export const useAppOrderContext = () => {
  return useContext(AppOrderContext);
};

/**
 *  returns the list of apps/app nav information as filtered by permissions.
*/
function getAllowedApps(appModules, stripes, pathname, lastVisited, formatMessage) {
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
      href: lastVisited.x_settings || SETTINGS_ROUTE,
      active: pathname.startsWith(SETTINGS_ROUTE),
      description: formatMessage({ id: 'stripes-core.folioSettings' }),
      iconData: {
        src: settingsIcon,
        alt: formatMessage({ id: 'stripes-core.folioSettings' }),
        title: formatMessage({ id: 'stripes-core.settings' }),
      },
      route: SETTINGS_ROUTE
    });
  }
  return apps.toSorted((a, b) => a.displayName.localeCompare(b.displayName));
}

/**
 * Context provider component for AppOrderContext.
 * @param {object} props - The component props
 * @param {React.ReactNode} props.children - The children to render within the provider
 * @returns {JSX.Element} - The context provider with children
 */
export const AppOrderProvider = ({ children }) => { // eslint-disable-line react/prop-types
  const { lastVisited } = useContext(LastVisitedContext);
  const { app } = useModules();
  const stripes = useStripes();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const { getPreference, setPreference, removePreference } = usePreferences();

  const { data: userAppList, isLoading, refetch: refetchAppList } = useQuery(
    `${stripes?.user?.user?.id}-pref-query`,
    () => getPreference({ key: APPORDER_PREF_NAME, scope: APPORDER_PREF_SCOPE })
  );

  // returns list of apps in user-defined order. By alpha if no order defined.
  const apps = useMemo(() => {
    if (!stripes) return [];
    // get list of available apps filtered based on user permissions, in configuration order.
    const platformApps = getAllowedApps(app, stripes, pathname, lastVisited, formatMessage);

    let orderedApps = userAppList || []; // the persisted, user-preferred app order.
    let navList = []; // contains the ultimate reordered array of app nav items.

    // No length in the persisted preference (orderedApps) means that apps should just be ordered as configured from stripes-config. (default)
    if (!orderedApps?.length) {
      // value for the order preference just contain a subset of the fields in the app object...
      orderedApps = platformApps.map(({ name }) => ({ name }));
      navList = platformApps;
    } else {
      // filter saved app positions by permission.
      orderedApps = orderedApps.filter(({ name }) => {
        if (name === 'settings') {
          return stripes.hasPerm('settings.enabled');
        }
        const perm = `module.${name}.enabled`;
        return stripes.hasPerm(perm);
      });

      // sort the platformApps according to the preference. Apps not persisted in the preference are
      // sent to the back of the list. Otherwise they are ordered the same as the preference list.
      navList = platformApps.sort((a, b) => {
        const aIndex = orderedApps.findIndex(({ name }) => a.name === name);
        const bIndex = orderedApps.findIndex(({ name }) => b.name === name);

        if (bIndex === -1) {
          return -1;
        }

        if (aIndex === -1) {
          return 1;
        }
        return aIndex - bIndex;
      });

      // find the apps from the platform that are not saved in user-reordered list and tack them on at the end.
      // these cover permission changes/apps added... can be labeled as 'new' in the preference settings.
      platformApps.forEach((platApp) => {
        if (!orderedApps.find((oa) => oa.name === platApp.name)) {
          orderedApps.push({
            name: platApp.name,
            isNew: true,
          });
        }
      });
    }

    return { navList, orderedApps };
  }, [formatMessage, app, lastVisited, userAppList, pathname]); // eslint-disable-line

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
