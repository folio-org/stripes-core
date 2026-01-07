import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { okapi } from 'stripes-config';
import { useStripes } from '../StripesContext';
import { ModulesContext, useModules, modulesInitialState } from '../ModulesContext';
import loadRemoteComponent from '../loadRemoteComponent';
import { loadEntitlement } from './loadEntitlement';
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

export const preloadModules = async (stripes, remotes) => {
  const modules = { app: [], plugin: [], settings: [], handler: [] };

  try {
    const loaderArray = [];
    remotes.forEach(remote => {
      const { name, url } = remote;
      loaderArray.push(loadRemoteComponent(url, name)
        .then((module) => {
          remote.getModule = () => module.default;
        })
        .catch((e) => { throw new Error(`Error loading code for remote module: ${name}: ${e}`); }));
    });

    await Promise.all(loaderArray);

    // once the all the code for the modules are loaded, populate the `modules` structure based on `actsAs` keys.
    remotes.forEach((remote) => {
      const { actsAs } = remote;
      actsAs.forEach(type => modules[type].push({ ...remote }));
    });
  } catch (e) {
    stripes.logger.log('core', `Error preloading modules from entitlement response: ${e}`);
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
const loadTranslations = async (stripes, module) => {
  // construct a fully-qualified URL to load.
  //
  // locale strings include a name plus optional region and numbering system.
  // we only care about the name and region. This strips off any numbering system
  // and converts from kebab-case (the IETF standard) to snake_case (which we
  // somehow adopted for our files in Lokalise).
  const locale = stripes.locale.split('-u-nu-')[0].replace('-', '_');
  const url = `${module.host}:${module.port}/translations/${locale}.json`;
  stripes.logger.log('core', `loading ${locale} translations for ${module.name}`);

  const res = await fetch(url);
  if (res.ok) {
    const fetchedTranslations = await res.json();
    const tx = { ...stripes.okapi.translations, ...fetchedTranslations };
    stripes.setTranslations(tx);
    return tx;
  } else {
    throw new Error(`Could not load translations for ${module.name}`);
  }
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
  if (module.icons?.length) {
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
export const loadModuleAssets = async (stripes, module) => {
  // register icons
  loadIcons(stripes, module);

  // register sounds
  // TODO loadSounds(stripes, module);

  // register translations
  try {
    const tx = await loadTranslations(stripes, module);
    let newDisplayName;
    if (module.displayName) {
      if (typeof tx[module.displayName] === 'string') {
        newDisplayName = tx[module.displayName];
      } else {
        newDisplayName = tx[module.displayName][0].value;
      }
    }

    const adjustedModule = {
      ...module,
      displayName: module.displayName ?
        newDisplayName : module.module,
    };
    return adjustedModule;
  } catch (e) {
    stripes.logger.log('core', `Error loading assets for ${module.name}: ${e.message || e}`);
    throw new Error(`Error loading assets for ${module.name}: ${e.message || e}`);
  }
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
 * handleRemoteModuleError
 * @param {*} stripes
 * @param {*} errorMsg
 * logs error to stripes and throws the error.
 */
const handleRemoteModuleError = (stripes, errorMsg) => {
  stripes.logger.log('core', errorMsg);
  throw new Error(errorMsg);
};


/**
 * Registry Loader
 * @param {object} stripes
 * @param {*} children
 * @returns
 */
const EntitlementLoader = ({ children }) => {
  const stripes = useStripes();
  const configModules = useModules();
  const [remoteModules, setRemoteModules] = useState(modulesInitialState);

  // if platform is configured for module federation, read the list of registered apps from <fill in source of truth>
  // localstorage, okapi, direct call to registry endpoint?
  useEffect(() => {
    if (okapi.entitlementUrl) {
      const fetchRegistry = async () => {
        // read the list of registered apps
        let remotes;
        try {
          remotes = await loadEntitlement(okapi.entitlementUrl);
        } catch (e) {
          handleRemoteModuleError(stripes, `Error fetching entitlement registry from ${okapi.entitlementUrl}: ${e}`);
        }

        let cachedModules = modulesInitialState;
        let remotesWithLoadedAssets = [];

        try {
          // load module assets (translations, icons), then load modules...
          remotesWithLoadedAssets = await loadAllModuleAssets(stripes, remotes);
        } catch (e) {
          handleRemoteModuleError(stripes, `Error loading remote module assets (icons, translations, sounds): ${e}`);
        }

        try {
          // load module code - this loads each module only once and up `getModule` so that it can be used sychronously.
          cachedModules = await preloadModules(stripes, remotesWithLoadedAssets);
        } catch (e) {
          handleRemoteModuleError(stripes, `error loading remote modules: ${e}`);
        }
        setRemoteModules(cachedModules);
      };

      fetchRegistry();
    }
    // no, we don't want to refetch the registry if stripes changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const combinedModules = useMemo(() => {
    const baseModules = {};
    Object.keys(modulesInitialState).forEach(key => { baseModules[key] = [...configModules[key], ...remoteModules[key]]; });
    return baseModules;
  }, [configModules, remoteModules]);

  return (
    <ModulesContext.Provider value={combinedModules}>
      {children}
    </ModulesContext.Provider>
  );
};

EntitlementLoader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ])
};

export default EntitlementLoader;
