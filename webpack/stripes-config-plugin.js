// This webpack plugin generates a virtual module containing the stripes configuration
// To access this configuration simply import 'stripes-config' within your JavaScript:
//   import { okapi, config, modules } from 'stripes-config';

const assert = require('assert');
const _ = require('lodash');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const StripesBrandingPlugin = require('./stripes-branding-plugin');
const StripesTranslationPlugin = require('./stripes-translations-plugin');
const serialize = require('serialize-javascript');
const StripesModuleParser = require('./stripes-module-parser');

module.exports = class StripesConfigPlugin {
  constructor(options) {
    assert(_.isObject(options.modules), 'stripes-config-plugin was not provided a "modules" object for enabling stripes modules');
    this.options = _.omit(options, 'branding');
  }

  apply(compiler) {
    const enabledModules = this.options.modules;
    const stripesModuleParser = new StripesModuleParser(enabledModules, compiler.context, compiler.options.resolve.alias);
    const moduleConfigs = stripesModuleParser.parseEnabledModules();
    const mergedConfig = Object.assign({}, this.options, { modules: moduleConfigs });

    // Prep the virtual module now, we will write to it when ready
    const virtualModule = new VirtualModulesPlugin();
    compiler.apply(virtualModule);

    // Wait until after other plugins to generate virtual stripes-config
    compiler.plugin('after-plugins', (theCompiler) => {
      // Locate the StripesTranslationPlugin to grab its translation file list
      const translationPlugin = theCompiler.options.plugins.find(plugin => plugin instanceof StripesTranslationPlugin);
      const brandingPlugin = theCompiler.options.plugins.find(plugin => plugin instanceof StripesBrandingPlugin);

      // Create a virtual module for Webpack to include in the build
      const stripesVirtualModule = `
        const { okapi, config, modules } = ${serialize(mergedConfig, { space: 2 })};
        const branding = ${brandingPlugin.serializedBranding};
        const translations = ${serialize(translationPlugin.allFiles, { space: 2 })};
        export { okapi, config, modules, branding, translations };
      `;

      virtualModule.writeModule('node_modules/stripes-config.js', stripesVirtualModule);
    });
  }
};
