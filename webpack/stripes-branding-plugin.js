// This webpack plugin generates a virtual module containing the stripes tenant branding configuration
// The virtual module contains require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const defaultBranding = require('../default-assets/branding');
const logger = require('./logger')('stripesBrandingPlugin');

module.exports = class StripesBrandingPlugin {
  constructor(tenantBranding) {
    logger.log('initializing...');
    // TODO: Validate incoming tenantBranding paths
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
  }

  apply(compiler) {
    // FaviconsWebpackPlugin will inject the necessary html via HtmlWebpackPlugin
    const faviconPath = StripesBrandingPlugin._initFavicon(this.branding.favicon.src);
    compiler.apply(new FaviconsWebpackPlugin(faviconPath));
  }

  // Prep favicon path for use with HtmlWebpackPlugin
  static _initFavicon(favicon) {
    if (path.isAbsolute(favicon)) {
      return favicon;
    }
    return path.join(path.resolve(), favicon);
  }
};
