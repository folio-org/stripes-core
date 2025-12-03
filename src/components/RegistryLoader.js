import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { okapi } from 'stripes-config';
import { useStripes } from '../StripesContext';
import { ModulesContext } from '../ModulesContext';
import loadRemoteComponent from '../loadRemoteComponent';

/**
 * preloadModules
 * Loads each module code and sets up its getModule function.
 * Map the list of applications to a hash keyed by acts-as type (app, plugin,
 * settings, handler) where the value of each is an array of corresponding
 * applications.
 *
 * @param {array} remotes
 * @returns {app: [], plugin: [], settings: [], handler: []}
 */

const preloadModules = async (remotes) => {
  const modules = { app: [], plugin: [], settings: [], handler: [] };

  try {
    const loaderArray = [];
    remotes.forEach(async remote => {
      const { name, url } = remote;
      loaderArray.push(loadRemoteComponent(url, name)
        .then((module) => {
          remote.getModule = () => module.default;
        }));
    });
    await Promise.all(loaderArray);
    remotes.forEach((remote) => {
      const { actsAs } = remote;
      actsAs.forEach(type => modules[type].push({ ...remote }));
    });
  } catch (e) {
    console.error('Error parsing modules from registry', e);
  }

  return modules;
};

/**
 * loadTranslations
 * return a promise that fetches translations for the given module,
 * dispatches setLocale, and then returns the translations.
 *
 * @param {object} stripes
 * @param {object} module info read from the registry
 *
 * @returns {Promise}
 */
const loadTranslations = (stripes, module) => {
  // construct a fully-qualified URL to load.
  //
  // locale strings include a name plus optional region and numbering system.
  // we only care about the name and region. this stripes the numberin system
  // and converts from kebab-case (the IETF standard) to snake_case (which we
  // somehow adopted for our files in Lokalise).
  const locale = stripes.locale.split('-u-nu-')[0].replace('-', '_');
  const url = `${module.host}:${module.port}/translations/${locale}.json`;
  stripes.logger.log('core', `loading ${locale} translations for ${module.name}`);

  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json().then((translations) => {
          // 1. translation entries look like "key: val"; we want "ui-${app}.key: val"
          // 2. module.name is snake_case (I have no idea why); we want kebab-case
          // const prefix = module.name.replace('folio_', 'ui-').replaceAll('_', '-');
          // const keyed = [];
          // Object.keys(translations).forEach(key => {
          //   keyed[`${prefix}.${key}`] = translations[key];
          // });

          const tx = { ...stripes.okapi.translations, ...translations };

          // stripes.store.dispatch(setTranslations(tx));

          // const tx = { ...stripes.okapi.translations, ...keyed };
          // console.log(`filters.status.active: ${tx['ui-users.filters.status.active']}`)
          stripes.setLocale(stripes.locale, tx);
          return tx;
        });
      } else {
        throw new Error(`Could not load translations for ${module}`);
      }
    });
};

/**
 * loadIcons
 * Register remotely-hosted icons with stripes by dispatching addIcon
 * for each element of the module's icons array.
 *
 * @param {object} stripes
 * @param {object} module info read from the registry
 *
 * @returns {void}
 */
const loadIcons = (stripes, module) => {
  if (module.icons && module.icons.length) {
    stripes.logger.log('core', `loading icons for ${module.module}`);
    module.icons.forEach(i => {
      stripes.logger.log('core', `  > ${i.name}`);

      const icon = {
        [i.name]: {
          src: `${module.host}:${module.port}/icons/${i.name}.svg`,
          alt: i.title,
        }
      };
      stripes.addIcon(module.module, icon);
    });
  }
};

/**
 * loadModuleAssets
 * Load a module's icons, translations, and sounds.
 * @param {object} stripes
 * @param {object} module info read from the registry
 * @returns {} copy of the module, plus the key `displayName` containing its localized name
 */
const loadModuleAssets = (stripes, module) => {
  // register icons
  loadIcons(stripes, module);

  // register sounds
  // TODO loadSounds(stripes, module);

  // register translations
  return loadTranslations(stripes, module)
    .then((tx) => {
      // tx[module.displayName] instead of formatMessage({ id: module.displayName})
      // because updating store is async and we don't have the updated values quite yet...
      //
      // when translations are compiled, the value of the tx[module.displayName] is an array
      // containing a single object with shape { type: 'messageFormatPattern', value: 'the actual string' }
      // so we have to extract the value from that structure.
      let newDisplayName;
      if (module.displayName) {
        if (typeof tx[module.displayName] === 'string') {
          newDisplayName = tx[module.displayName];
        } else {
          newDisplayName = tx[module.displayName][0].value;
        }
      }

      return {
        ...module,
        displayName: module.displayName ?
          newDisplayName : module.module,
      };
    })
    .catch(e => {
      // eslint-disable-next-line no-console
      console.error(e);
    });
};

/**
 * loadAllModuleAssets
 * Loads icons, translations, and sounds for all modules. Inserts the correct 'displayName' for each module.
 * @param {props}
 * @returns Promise
 */
const loadAllModuleAssets = async (stripes, remotes) => {
  return Promise.all(remotes.map((r) => loadModuleAssets(stripes, r)));
};

/**
 * Registry Loader
 * @param {object} stripes
 * @param {*} children
 * @returns
 */
const RegistryLoader = ({ children }) => {
  const stripes = useStripes();
  const [modules, setModules] = useState(stripes.modules);

  // if platform is configured for module federation, read the list of registered apps from <fill in source of truth>
  // localstorage, okapi, direct call to registry endpoint?
  useEffect(() => {
    if (okapi.entitlementUrl) {
      const fetchRegistry = async () => {
        // read the list of registered apps
        const registry = await fetch(okapi.entitlementUrl).then((response) => response.json());

        // remap registry from an object shaped like { key1: app1, key2: app2, ...}
        // to an array shaped like [ { name: key1, ...app1 }, { name: key2, ...app2 } ...]
        const remotes = Object.entries(registry.remotes).map(([name, metadata]) => ({ name, ...metadata }));

        // load module assets (translations, icons), then load modules...
        const remotesWithLoadedAssets = await loadAllModuleAssets(stripes, remotes);
        // load module code - this loads each module only once and up `getModule` so that it can be used sychronously.
        const cachedModules = await preloadModules(remotesWithLoadedAssets);

        const combinedModules = { ...stripes.modules, ...cachedModules };

        // prefetch
        setModules(combinedModules);
      };

      fetchRegistry();
    }
    // no, we don't want to refetch the registry if stripes changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModulesContext.Provider value={modules}>
      {modules ? children : null}
    </ModulesContext.Provider>
  );
};

RegistryLoader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ])
};

export default RegistryLoader;
