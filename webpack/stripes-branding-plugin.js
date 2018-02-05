// This webpack plugin generates a virtual module containing the stripes tenant branding configuration
// The virtual module contains require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const defaultBranding = require('../default-assets/branding');

module.exports = class StripesBrandingPlugin {
  constructor(tenantBranding) {
    // TODO: Validate incoming tenantBranding paths
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
  }

  apply(compiler) {
    const brandingVirtualModule = `module.exports = ${StripesBrandingPlugin._serializeBranding(this.branding)};`;

    compiler.apply(new VirtualModulesPlugin({
      'node_modules/stripes-branding.js': brandingVirtualModule,
    }));

    // Locate the HtmlWebpackPlugin and apply the favicon.
    compiler.plugin('after-plugins', theCompiler => this._replaceFavicon(theCompiler));
  }

  // Serialize the branding config.
  static _serializeBranding(branding) {
    const assetPath = (thePath) => {
      if (path.isAbsolute(thePath)) {
        return thePath;
      }

      return path.join('..', thePath); // Look outside the node_modules directory
    };

    // Wraps image paths with require()'s for webpack to process via its file loaders
    // The require()'s are just strings here so we don't attempt to invoke them right now
    const injectRequire = (key, value) => {
      if (key === 'src') {
        return `require('${assetPath(value)}')`;
      }

      return value;
    };
    // Serialize whole branding configuration, adding require()'s as needed
    const brandingString = JSON.stringify(branding, injectRequire, 2);

    // Now that the branding object has been serialized, this regex omits the wrapping quotes
    // surrounding the require()'s so they are invoked when Webpack loads stripes-config
    return brandingString.replace(/"(require\([^)]+\))"/g, (match, $1) => $1);
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
