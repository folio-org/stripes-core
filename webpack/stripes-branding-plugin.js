// This webpack plugin generates a virtual module containing the stripes tenant branding configuration
// The virtual module this will contain require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Default branding values
const defaultBranding = {
  logo: {
    src: '@folio/stripes-core/default-tenant-assets/folio-logo.png',
    alt: 'FOLIO University',
  },
  favicon: {
    src: '@folio/stripes-core/default-tenant-assets/favicon.ico',
  },
};

// Serialize the branding config.
function serializeBranding(branding) {
  const assetPath = (thePath) => {
    if (thePath.startsWith('@folio/stripes-core')) {
      return thePath;
    } else {
      return path.join('..', thePath); // Currently depends on custom path being relative to stripes.config.js
    }
  };

  // Wraps image paths with require()'s for webpack to process via its file loaders
  // The require()'s are just strings here so we don't attempt to invoke them right now
  const injectRequire = (key, value) => {
    if (key === 'src') {
      return `require('${assetPath(value)}')`;
    } else {
      return value;
    }
  };
  // Serialize whole branding configuration, adding require()'s as needed
  const brandingString = JSON.stringify(branding, injectRequire, 2);

  // Now that the branding object has been serialized, this regex omits the wrapping quotes
  // surrounding the require()'s so they are invoked when Webpack loads stripes-config
  return brandingString.replace(/"(require\([^)]+\))"/g, (match, $1) => $1);
}

// Prep favicon path for use with HtmlWebpackPlugin
function initFavicon(favicon) {
  if (favicon.startsWith('@folio/stripes-core')) {
    return path.join(__dirname, '..', favicon.replace('@folio/stripes-core', ''));
  }
  return path.join(path.resolve(), favicon);
}

module.exports = class StripesBrandingPlugin {
  constructor(tenantBranding) {
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
  }

  apply(compiler) {
    const dynamicBrandingModule = `module.exports = ${serializeBranding(this.branding)};`;

    compiler.apply(new VirtualModulesPlugin({
      'node_modules/stripes-branding.js': dynamicBrandingModule,
    }));

    // Locate the HtmlWebpackPlugin and apply the favicon.
    compiler.plugin('after-plugins', (theCompiler) => {
      const index = theCompiler.options.plugins.findIndex(plugin => plugin instanceof HtmlWebpackPlugin);
      theCompiler.options.plugins[index].options.favicon = initFavicon(this.branding.favicon.src);
    });
  }
};
