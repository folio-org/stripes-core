import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { setTranslations } from '../okapiActions';
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
const registryUrl = 'http://localhost:3001/registry';

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
  const url = `${module.host}:${module.port}`;

  const parentLocale = stripes.locale.split('-')[0];
  // Since moment.js don't support translations like it or it-IT-u-nu-latn
  // we need to build string like it_IT for fetch call
  const loadedLocale = stripes.locale.replace('-', '_').split('-')[0];

  // react-intl provides things like pt-BR.
  // lokalise provides things like pt_BR.
  // so we have to translate '-' to '_' because the translation libraries
  // don't know how to talk to each other. sheesh.
  const region = stripes.locale.replace('-', '_');

  // Here we put additional condition because languages
  // like Japan we need to use like ja, but with numeric system
  // Japan language builds like ja_u, that incorrect. We need to be safe from that bug.
  if (!appTranslations.includes(url)) {
    appTranslations.push(url);
    return fetch(`${url}/translations/${region}.json`)
      .then((response) => {
        if (response.ok) {
          return response.json().then((translations) => {
            // translation entries look like "key: val"
            // but we want "ui-${app}.key: val"
            const prefix = module.name.replace('folio_', 'ui-');
            const keyed = [];
            Object.keys(translations).forEach(key => {
              keyed[`${prefix}.${key}`] = translations[key];
            });

            // I thought dispatch was synchronous, but without a return
            // statement here the calling function's invocations of
            // formatMessage() don't see the updated values in the store
            return stripes.store.dispatch(setTranslations({ ...stripes.okapi.translations, ...keyed }));
          });
        } else {
          throw new Error(`Could not load translations for ${module}`);
        }
      });
  } else {
    return Promise.resolve();
  }
};


const RegistryLoader = ({ stripes, children }) => {
  const { formatMessage } = useIntl();
  const [modules, setModules] = useState();

  useEffect(() => {
    const translateModule = (module) => {
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

    const translateModules = async ({ app, plugin, settings, handler }) => ({
      app: await Promise.all(app.map(translateModule)),
      plugin: await Promise.all(plugin.map(translateModule)),
      settings: await Promise.all(settings.map(translateModule)),
      handler: await Promise.all(handler.map(translateModule)),
    });

    const fetchRegistry = async () => {
      const response = await fetch(registryUrl);
      const registry = await response.json();
      const remotes = Object.entries(registry.remotes).map(([name, metadata]) => ({ name, ...metadata }));
      const parsedModules = await translateModules(parseModules(remotes));
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
