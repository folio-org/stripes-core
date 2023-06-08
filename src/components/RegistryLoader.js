import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { okapi } from 'stripes-config';

import { addIcon, setLocale, setTranslations } from '../okapiActions';
import { ModulesContext } from '../ModulesContext';
import loadRemoteComponent from '../loadRemoteComponent';

// TODO: should this be handled by registry?
const parseModules = (remotes) => {
  const modules = { app: [], plugin: [], settings: [], handler: [] };

  remotes.forEach(remote => {
    const { actsAs, ...rest } = remote;
    actsAs.forEach(type => modules[type].push(rest));
  });

  return modules;
};

// TODO: pass it via stripes config
const registryUrl = okapi.registryUrl;

const appTranslations = [];

/**
 * loadTranslations
 * return a promise that fetches translations for the given module and then
 * dispatches the translations.
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
  stripes.logger.log('core', `loading ${locale} translations for ${module.name}`)

  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json().then((translations) => {
          // 1. translation entries look like "key: val"; we want "ui-${app}.key: val"
          // 2. module.name is snake_case (I have no idea why); we want kebab-case
          const prefix = module.name.replace('folio_', 'ui-').replaceAll('_', '-');
          const keyed = [];
          Object.keys(translations).forEach(key => {
            keyed[`${prefix}.${key}`] = translations[key];
          });

          console.log(`was ${stripes.okapi.translations['ui-users.filters.status.active']}`)

          const tx = { ...stripes.okapi.translations, ...keyed };

          stripes.store.dispatch(setTranslations(tx));


          // const tx = { ...stripes.okapi.translations, ...keyed };
          // console.log(`filters.status.active: ${tx['ui-users.filters.status.active']}`)
          return stripes.setLocale(stripes.locale, tx).then(() => {
            console.log(`now ${stripes.okapi.translations['ui-users.filters.status.active']}`)

          });
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
      const icon = {
        [i.name]: {
          src: `${module.host}:${module.port}/icons/${i.name}.svg`,
          alt: i.title,
        }
      };
      stripes.store.dispatch(addIcon(module.module, icon));
    });
  }
};

const RegistryLoader = ({ stripes, children }) => {
  const { formatMessage } = useIntl();
  const [modules, setModules] = useState();

  useEffect(() => {
    const loadModuleAssets = (module) => {
      loadIcons(stripes, module);
      return loadTranslations(stripes, module)
        .then(() => {
          return {
            ...module,
            displayName: module.displayName ? formatMessage({ id: module.displayName }) : undefined,
          };
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    };

    const loadModules = async ({ app, plugin, settings, handler }) => ({
      app: await Promise.all(app.map(loadModuleAssets)),
      plugin: await Promise.all(plugin.map(loadModuleAssets)),
      settings: await Promise.all(settings.map(loadModuleAssets)),
      handler: await Promise.all(handler.map(loadModuleAssets)),
    });

    const fetchRegistry = async () => {
      const registry = await fetch(registryUrl).then((response) => response.json());
      const remotes = Object.entries(registry.remotes).map(([name, metadata]) => ({ name, ...metadata }));
      const parsedModules = await loadModules(parseModules(remotes));
      const { handler: handlerModules } = parsedModules;

      // prefetch all handlers so they can be executed in a sync way.
      if (handlerModules) {
        await Promise.all(handlerModules.map(async (module) => {
          const component = await loadRemoteComponent(module.url, module.name);
          module.getModule = () => component?.default;
        }));
      }

      setModules(parsedModules);
    };

    fetchRegistry();
  }, [stripes, formatMessage]);

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
