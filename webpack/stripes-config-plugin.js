// This webpack plugin generates a virtual module containing the stripes configuration
// To access this configuration simply import 'stripes-config' within your JavaScript:
//   import { okapi, config, modules } from 'stripes-config';

const _ = require('lodash');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const StripesBrandingPlugin = require('./stripes-branding-plugin');
const StripesTranslationPlugin = require('./stripes-translations-plugin');
const serialize = require('serialize-javascript');
const stripesModuleParser = require('./stripes-module-parser');
const StripesBuildError = require('./stripes-build-error');
const stripesSerialize = require('./stripes-serialize');

module.exports = class StripesConfigPlugin {
  constructor(options) {
    if (!_.isObject(options.modules)) {
      throw new StripesBuildError('stripes-config-plugin was not provided a "modules" object for enabling stripes modules');
    }
    this.options = _.omit(options, 'branding');
  }

  apply(compiler) {
    const enabledModules = this.options.modules;
    const { config, metadata, warnings } = stripesModuleParser.parseAllModules(enabledModules, compiler.context, compiler.options.resolve.alias);
    this.mergedConfig = Object.assign({}, this.options, { modules: config });
    this.metadata = metadata;
    this.warnings = warnings;

    // Prep the virtual module now, we will write to it when ready
    this.virtualModule = new VirtualModulesPlugin();
    compiler.apply(this.virtualModule);

    // Wait until after other plugins to generate virtual stripes-config
    compiler.plugin('after-plugins', theCompiler => this.afterPlugins(theCompiler));
    compiler.plugin('emit', (compilation, callback) => this.processWarnings(compilation, callback));
  }

  afterPlugins(compiler) {
    // Locate the StripesTranslationPlugin to grab its translation file list
    const translationPlugin = compiler.options.plugins.find(plugin => plugin instanceof StripesTranslationPlugin);
    const brandingPlugin = compiler.options.plugins.find(plugin => plugin instanceof StripesBrandingPlugin);

    // Create a virtual module for Webpack to include in the build
    const stripesVirtualModule = `
      const { okapi, config, modules } = ${serialize(this.mergedConfig, { space: 2 })};
      const branding = ${stripesSerialize.serializeWithRequire(brandingPlugin.branding)};
      const translations = ${serialize(translationPlugin.allFiles, { space: 2 })};
      const metadata = ${stripesSerialize.serializeWithRequire(this.metadata)};
      export { okapi, config, modules, branding, translations, metadata };
    `;

    this.virtualModule.writeModule('node_modules/stripes-config.js', stripesVirtualModule);
  }

  processWarnings(compilation, callback) {
    if (this.warnings.length) {
      compilation.warnings.push(new StripesBuildError(`stripes-config-plugin:\n  ${this.warnings.join('\n  ')}`));
    }
    callback();
  }
};
