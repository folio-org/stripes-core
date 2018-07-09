// This webpack plugin generates a virtual module containing the stripes configuration
// To access this configuration simply import 'stripes-config' within your JavaScript:
//   import { okapi, config, modules } from 'stripes-config';
//
// NOTE: If importing module data for UI purposes such as displaying
// the module name, DO NOT import this module.
// Instead, use the ModulesContext directly or via the withModules/withModule HOCs.

const _ = require('lodash');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const serialize = require('serialize-javascript');
const stripesModuleParser = require('./stripes-module-parser');
const StripesBuildError = require('./stripes-build-error');
const stripesSerialize = require('./stripes-serialize');
const logger = require('./logger')('stripesConfigPlugin');
const { SyncHook } = require('tapable');

module.exports = class StripesConfigPlugin {
  constructor(options) {
    logger.log('initializing...');
    if (!_.isObject(options.modules)) {
      throw new StripesBuildError('stripes-config-plugin was not provided a "modules" object for enabling stripes modules');
    }
    this.options = _.omit(options, 'branding');
  }

  apply(compiler) {
    const enabledModules = this.options.modules;
    logger.log('enabled modules:', enabledModules);
    const { config, metadata, warnings } = stripesModuleParser.parseAllModules(enabledModules, compiler.context, compiler.options.resolve.alias);
    this.mergedConfig = Object.assign({}, this.options, { modules: config });
    this.metadata = metadata;
    this.warnings = warnings;

    // Prep the virtual module now, we will write to it when ready
    this.virtualModule = new VirtualModulesPlugin();
    this.virtualModule.apply(compiler);

    // Establish hook for other plugins to update the config
    if (compiler.hooks.stripesConfigPluginBeforeWrite) {
      throw new StripesBuildError('StripesConfigPlugin hook already in use');
    }
    compiler.hooks.stripesConfigPluginBeforeWrite = new SyncHook(['config']);

    // Wait until after other plugins to generate virtual stripes-config
    compiler.hooks.afterPlugins.tap('StripesConfigPlugin', (theCompiler) => this.afterPlugins(theCompiler));
    compiler.hooks.emit.tapAsync('StripesConfigPlugin', (compilation, callback) => this.processWarnings(compilation, callback));
  }

  afterPlugins(compiler) {
    // Data provided by other stripes plugins via hooks
    const pluginData = {
      branding: {},
      translations: {},
    };
    compiler.hooks.stripesConfigPluginBeforeWrite.call(pluginData);

    // Create a virtual module for Webpack to include in the build
    const stripesVirtualModule = `
      const { okapi, config, modules } = ${serialize(this.mergedConfig, { space: 2 })};
      const branding = ${stripesSerialize.serializeWithRequire(pluginData.branding)};
      const translations = ${serialize(pluginData.translations, { space: 2 })};
      const metadata = ${stripesSerialize.serializeWithRequire(this.metadata)};
      export { okapi, config, modules, branding, translations, metadata };
    `;

    logger.log('writing virtual module...', stripesVirtualModule);
    this.virtualModule.writeModule('node_modules/stripes-config.js', stripesVirtualModule);
  }

  processWarnings(compilation, callback) {
    if (this.warnings.length) {
      compilation.warnings.push(new StripesBuildError(`stripes-config-plugin:\n  ${this.warnings.join('\n  ')}`));
    }
    callback();
  }
};
