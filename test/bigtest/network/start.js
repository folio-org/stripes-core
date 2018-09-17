import './force-fetch-polyfill';
import Mirage, { camelize } from '@bigtest/mirage';
import baseConfig from './config';

const { assign } = Object;
const environment = process.env.NODE_ENV || 'test';

const req = require.context('./', true, /\.js$/);

const modules = req.keys().reduce((acc, modulePath) => {
  const moduleParts = modulePath.split('/');
  const moduleType = moduleParts[1];
  const moduleName = moduleParts[2];

  if (moduleName) {
    const moduleKey = camelize(moduleName.replace('.js', ''));

    return assign(acc, {
      [moduleType]: {
        ...(acc[moduleType] || {}),
        [moduleKey]: req(modulePath).default
      }
    });
  } else {
    return acc;
  }
}, {});

export default function startMirage(...scenarioNames) {
  const { scenarios, ...options } = modules;
  const server = new Mirage(assign(options, { baseConfig, environment }));

  // mirage only loads a `default` scenario for us out of the box, so
  // instead we run any scenarios after we initialize mirage
  scenarioNames.filter(Boolean).forEach(name => {
    const scenario = scenarios[camelize(name)];
    if (scenario) scenario(server);
  });

  return server;
}
