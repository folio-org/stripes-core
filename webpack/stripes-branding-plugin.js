// This webpack plugin generates a virtual module containing the stripes tenant branding configuration
// The virtual module contains require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const defaultBranding = require('../default-assets/branding');

module.exports = class StripesBrandingPlugin {
  constructor(tenantBranding) {
    // TODO: Validate incoming tenantBranding paths
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
  }

  apply(compiler) {
    // Locate the HtmlWebpackPlugin and apply the favicon.
    compiler.plugin('after-plugins', theCompiler => this._replaceFavicon(theCompiler));
  }

  // Prep favicon path for use with HtmlWebpackPlugin
  static _initFavicon(favicon) {
    if (path.isAbsolute(favicon)) {
      return favicon;
    }
    return path.join(path.resolve(), favicon);
  }

  // Find the HtmlWebpackPlugin and modify its favicon option
  _replaceFavicon(compiler) {
    const index = compiler.options.plugins.findIndex(plugin => plugin instanceof HtmlWebpackPlugin);
    compiler.options.plugins[index].options.favicon = StripesBrandingPlugin._initFavicon(this.branding.favicon.src);
  }
};
