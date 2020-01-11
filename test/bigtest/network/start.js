/* eslint global-require: off, import/no-mutable-exports: off */
import merge from 'lodash/merge';
import flow from 'lodash/flow';
import camelCase from 'lodash/camelCase';

const environment = process.env.NODE_ENV || 'test';

let start = () => {};

if (environment !== 'production') {
  const { Server: MirageJsServer } = require('miragejs');
  const { default: BigTestMirageServer } = require('@bigtest/mirage');

  const { default: coreModules } = require('./index');
  require('./force-fetch-polyfill');
  require('./patch-fake-xml-http-request');

  const createServer = (Server, options, configName) => {
    const {
      baseConfig: coreConfig,
      ...coreOpts
    } = coreModules;

    const {
      baseConfig = () => {},
      ...opts
    } = options;

    return new Server(merge({
      [configName]: flow(coreConfig, baseConfig),
      environment
    }, coreOpts, opts));
  };

  start = (scenarioNames, options = {}) => {
    const {
      scenarios: coreScenarios = {},
      factories: coreFactories = {},
      fixtures: coreFixtures = {},
    } = coreModules;

    const {
      serverType,
      scenarios = {},
      factories = {},
      fixtures = {},
    } = options;

    // 'serverType' option can be used to control which mirage
    // server implementation will be used.
    // The BigTest mirage implementation is set as a default
    // for backward compatibility.
    const server = (serverType === 'miragejs') ?
      createServer(MirageJsServer, options, 'routes') :
      createServer(BigTestMirageServer, options, 'baseConfig');

    // mirage conditionally includes factories, we want to include
    // all of them unconditionally
    server.loadFactories(coreFactories);
    server.loadFactories(factories);

    // without initial factories mirage loads all fixtures by default;
    // we only want to load them when calling `loadFixtures`, so we
    // manually add them back here to avoid mirage auto-loading
    server.options.fixtures = merge({}, coreFixtures, fixtures);

    // the default scenario is only used when not in test mode
    let defaultScenario;
    if (!scenarioNames && environment !== 'test') {
      defaultScenario = 'default';
    }

    // mirage only loads a `default` scenario for us out of the box,
    // so instead of providing all scenarios we run specific scenarios
    // after the mirage server is initialized.
    [].concat(scenarioNames || defaultScenario).filter(Boolean).forEach(name => {
      const key = camelCase(name);
      const scenario = scenarios[key] || coreScenarios[key];
      if (scenario) scenario(server);
    });

    return server;
  };
}

export default start;
