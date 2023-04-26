import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

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

const RegistryLoader = ({ children }) => {
  const { formatMessage } = useIntl();
  const [modules, setModules] = useState();

  useEffect(() => {
    const translateModule = (module) => ({
      ...module,
      displayName: module.displayName ? formatMessage({ id: module.displayName }) : undefined,
    });

    const translateModules = ({ app, plugin, settings, handler }) => ({
      app: app.map(translateModule),
      plugin: plugin.map(translateModule),
      settings: settings.map(translateModule),
      handler: handler.map(translateModule),
    });

    const fetchRegistry = async () => {
      const response = await fetch(registryUrl);
      const registry = await response.json();
      const remotes = Object.entries(registry.remotes).map(([name, metadata]) => ({ name, ...metadata }));
      const parsedModules = translateModules(parseModules(remotes));
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
  ])
};


export default RegistryLoader;
