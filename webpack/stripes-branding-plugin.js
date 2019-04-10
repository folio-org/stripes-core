// This webpack plugin generates a virtual module containing the stripes tenant branding configuration
// The virtual module contains require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const defaultBranding = require('../default-assets/branding');
const logger = require('./logger')('stripesBrandingPlugin');

// Complete favicon settings for favicons-webpack-plugin
const allFavicons = {
  android: true,
  appleIcon: true,
  appleStartup: true,
  coast: true,
  favicons: true,
  firefox: true,
  windows: true,
  yandex: true,
};

module.exports = class StripesBrandingPlugin {
  constructor(options) {
    logger.log('initializing...');
    // TODO: Validate incoming tenantBranding paths
    const tenantBranding = (options && options.tenantBranding) ? options.tenantBranding : {};
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
    this.enableFavicons = options && options.enableFavicons;
  }

  apply(compiler) {
    // Skip favicon in development mode due to memory issues (STCOR-296)
    if (this.enableFavicons) {
      const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
      // FaviconsWebpackPlugin will inject the necessary html via HtmlWebpackPlugin
      const faviconOptions = this._getFaviconOptions();
      new FaviconsWebpackPlugin(faviconOptions).apply(compiler);
    }

    // Hook into stripesConfigPlugin to supply branding config
    compiler.hooks.stripesConfigPluginBeforeWrite.tap('StripesBrandingPlugin', (config) => {
      config.branding = this.branding;
      logger.log('stripesConfigPluginBeforeWrite', config.branding);
    });
  }

  _getFaviconOptions() {
    const faviconOptions = {
      logo: StripesBrandingPlugin._initFavicon(this.branding.favicon.src),
      icons: allFavicons,
    };
    logger.log('favicon options', faviconOptions);
    return faviconOptions;
  }

  // Prep favicon path for use with HtmlWebpackPlugin
  static _initFavicon(favicon) {
    if (path.isAbsolute(favicon)) {
      return favicon;
    }
    return path.join(path.resolve(), favicon);
  }
};
