// This webpack plugin generates a virtual module containing the stripes configuration
// To access this configuration simply import 'stripes-config' within your JavaScript:
//   import { okapi, config, modules } from 'stripes-config';

const path = require('path');
const assert = require('assert');
const _ = require('lodash');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const StripesTranslationPlugin = require('./stripes-translations-plugin');
const serialize = require('serialize-javascript');

// Loads description, version, and stripes configuration from a module's package.json
function loadDefaults(context, moduleName, alias) {
  let aPath;
  if (alias[moduleName]) {
    aPath = require.resolve(path.join(alias[moduleName], 'package.json'));
  } else {
    try {
      aPath = require.resolve(path.join(context, 'node_modules', moduleName, '/package.json'));
    } catch (e) {
      try {
        // The above resolution is overspecific and prevents some use cases eg. yarn workspaces
        aPath = require.resolve(path.join(moduleName, '/package.json'));
      } catch (e2) {
        try {
          // This better incorporates the context path but requires nodejs 9+
          aPath = require.resolve(path.join(moduleName, '/package.json'), { paths: [context] });
        } catch (e3) { throw e3; }
      }
    }
  }

  const { stripes, description, version } = require(aPath); // eslint-disable-line
  assert(_.isObject(stripes, `included module ${moduleName} does not have a "stripes" key in package.json`));
  assert(_.isString(stripes.type, `included module ${moduleName} does not specify stripes.type in package.json`));
  return { stripes, description, version };
}

function appendOrSingleton(maybeArray, newValue) {
  const singleton = [newValue];
  if (Array.isArray(maybeArray)) return maybeArray.concat(singleton);
  return singleton;
}

// Generates stripes configuration for the tenant's enabled modules
function parseStripesModules(enabledModules, context, alias) {
  const moduleConfigs = {};
  _.forOwn(enabledModules, (moduleConfig, moduleName) => {
    const { stripes, description, version } = loadDefaults(context, moduleName, alias);
    const stripeConfig = Object.assign({}, stripes, moduleConfig, {
      module: moduleName,
      getModule: new Function([], `return require('${moduleName}').default;`), // eslint-disable-line no-new-func
      description,
      version,
    });
    delete stripeConfig.type;
    moduleConfigs[stripes.type] = appendOrSingleton(moduleConfigs[stripes.type], stripeConfig);
  });
  return moduleConfigs;
}

module.exports = class StripesConfigPlugin {
  constructor(options) {
    assert(_.isObject(options.modules), 'stripes-config-plugin was not provided a "modules" object for enabling stripes modules');
    this.options = _.omit(options, 'branding');
  }

  apply(compiler) {
    const enabledModules = this.options.modules;
    const moduleConfigs = parseStripesModules(enabledModules, compiler.context, compiler.options.resolve.alias);
    const mergedConfig = Object.assign({}, this.options, { modules: moduleConfigs });

    // Wait until after other plugins to generate virtual stripes-config
    compiler.plugin('after-plugins', (theCompiler) => {
      // Locate the StripesTranslationPlugin to grab its translation file list
      const translationPlugin = theCompiler.options.plugins.find(plugin => plugin instanceof StripesTranslationPlugin);

      // Create a virtual module for Webpack to include in the build
      const stripesVirtualModule = `
        import branding from 'stripes-branding';
        const { okapi, config, modules } = ${serialize(mergedConfig, { space: 2 })};
        const translations = ${serialize(translationPlugin.allFiles, { space: 2 })};
        export { okapi, config, modules, branding, translations };
      `;

      compiler.apply(new VirtualModulesPlugin({
        'node_modules/stripes-config.js': stripesVirtualModule,
      }));
    });
  }
};
