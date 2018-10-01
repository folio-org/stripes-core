/* eslint global-require: off, import/no-mutable-exports: off */
import merge from 'lodash/merge';
import flow from 'lodash/flow';

const environment = process.env.NODE_ENV || 'test';

let start = () => {};

if (environment !== 'production') {
  const { default: Mirage, camelize } = require('@bigtest/mirage');
  const { default: coreModules } = require('./index');
  require('./force-fetch-polyfill');

  start = (scenarioNames, options = {}) => {
    const {
      scenarios: coreScenarios = {},
      factories: coreFactories = {},
      baseConfig: coreConfig,
      ...coreOpts
    } = coreModules;

    const {
      scenarios = {},
      factories = {},
      baseConfig = () => {},
      ...opts
    } = options;

    const server = new Mirage(merge({
      baseConfig: flow(coreConfig, baseConfig),
      environment
    }, coreOpts, opts));

    // mirage conditionally includes factories, we want to include
    // all of them unconditionally
    server.loadFactories(coreFactories);
    server.loadFactories(factories);

    // the default scenario is only used when not in test mode
    let defaultScenario;
    if (!scenarioNames && environment !== 'test') {
      defaultScenario = 'default';
    }

    // mirage only loads a `default` scenario for us out of the box,
    // so instead of providing all scenarios we run specific scenarios
    // after the mirage server is initialized.
    [].concat(scenarioNames || defaultScenario).filter(Boolean).forEach(name => {
      const key = camelize(name);
      const scenario = scenarios[key] || coreScenarios[key];
      if (scenario) scenario(server);
    });

    return server;
  };
}

export default start;
