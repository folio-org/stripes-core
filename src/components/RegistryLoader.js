import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { okapi } from 'stripes-config';

import { ModulesContext } from '../ModulesContext';
import loadRemoteComponent from '../loadRemoteComponent';

/**
 * parseModules
 * Map the list of applications to a hash keyed by acts-as type (app, plugin,
 * settings, handler) where the value of each is an array of corresponding
 * applications.
 *
 * @param {array} remotes
 * @returns {app: [], plugin: [], settings: [], handler: []}
 */
const parseModules = async (remotes) => {
  const modules = { app: [], plugin: [], settings: [], handler: [] };

  // TODO finish prefetching modules here....
  try {
    const loaderArray = [];
    remotes.forEach(async remote => {
      const { name, url } = remote;
      // setting getModule for backwards compatibility with parts of stripes that call it..
      loaderArray.push(loadRemoteComponent(url, name));
    });
    await Promise.all(loaderArray);
    remotes.forEach((remote, i) => {
      const { actsAs, name, url, ...rest } = remote;
      const getModule = () => loaderArray[i].default;
      actsAs.forEach(type => modules[type].push({ actsAs, name, url, getModule, ...rest }));
    });
  } catch (e) {
    console.error('Error parsing modules from registry', e);
  }

  return modules;
};

const preloadModules = async (remotes) => {
  const modules = { app: [], plugin: [], settings: [], handler: [] };

  // TODO finish prefetching modules here....
  try {
    const loaderArray = [];
    remotes.forEach(async remote => {
      const { name, url } = remote;
      // setting getModule for backwards compatibility with parts of stripes that call it..
      loaderArray.push(loadRemoteComponent(url, name));
    });
    await Promise.all(loaderArray);
    remotes.forEach((remote, i) => {
      const { actsAs, name, url, ...rest } = remote;
      const getModule = () => loaderArray[i].default;
      actsAs.forEach(type => modules[type].push({ actsAs, name, url, getModule, ...rest }));
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
      // because ... I'm not sure exactly. I suspect the answer is that we're doing
      // something async somewhere but not realizing it, and therefore not returning
      // a promise. thus, loadTranslations returns before it's actually done loading
      // translations, and calling formatMessage(...) here executes before the new
      // values are loaded.
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
 * loadModules
 * NB: this means multi-type modules, i.e. those like `actsAs: [app, settings]`
 * will be loaded multiple times. I'm not sure that's right.
 * @param {props}
 * @returns Promise
 */
const loadModules = async ({ app, plugin, settings, handler, stripes }) => ({
  app: await Promise.all(app.map(i => loadModuleAssets(stripes, i))),
  plugin: await Promise.all(plugin.map(i => loadModuleAssets(stripes, i))),
  settings: await Promise.all(settings.map(i => loadModuleAssets(stripes, i))),
  handler: await Promise.all(handler.map(i => loadModuleAssets(stripes, i))),
});

const loadAllModuleAssets = async (stripes, remotes) => {
  return Promise.all(remotes.map((r) => loadModuleAssets(stripes, r)));
};

/**
 * Registry Loader
 * @param {object} stripes
 * @param {*} children
 * @returns
 */
const RegistryLoader = ({ stripes, children }) => {
  const [modules, setModules] = useState();

  // read the list of registered apps from the registry,
  useEffect(() => {
    const fetchRegistry = async () => {
      // read the list of registered apps
      const registry = await fetch(okapi.registryUrl).then((response) => response.json());

      // remap registry from an object shaped like { key1: app1, key2: app2, ...}
      // to an array shaped like [ { name: key1, ...app1 }, { name: key2, ...app2 } ...]
      const remotes = Object.entries(registry.remotes).map(([name, metadata]) => ({ name, ...metadata }));

      // load module assets, then load modules...
      const remotesWithLoadedAssets = await loadAllModuleAssets(stripes, remotes);
      // const parsedModules = await loadModules({ stripes, ...parseModules(remotes) });
      const parsedModules = await preloadModules(remotesWithLoadedAssets);
      // prefetch all handlers so they can be executed in a sync way.
      // const { handler: handlerModules } = parsedModules;
      // if (handlerModules) {
      //   await Promise.all(handlerModules.map(async (module) => {
      //     const component = await loadRemoteComponent(module.url, module.name);
      //     module.getModule = () => component?.default;
      //   }));
      // }

      // preload all modules...
      for (const type in parsedModules) {
        if (parsedModules[type]) {
          parsedModules[type].forEach(async (module) => {
            const loadedModule = await loadRemoteComponent(module.url, module.name);
            module.getModule = () => loadedModule?.default;
          });
        }
      }

      // prefetch
      setModules(parsedModules);
    };

    fetchRegistry();
    // We know what we are doing here so just ignore the dependency warning about 'formatMessage'
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
  ]),
  stripes: PropTypes.object.isRequired,
};


export default RegistryLoader;
