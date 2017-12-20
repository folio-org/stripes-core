// Invoked by stripes-config-plugin, this module handles parsing logic and defaults for branding.
// It generates a serialized branding string to supplement the strips-config virtual module.
// The branding string will contain require()'s needed for webpack to pull images into the bundle.

const path = require('path');
const _ = require('lodash');

// Default branding values
// TODO: Better default handling needed.
const defaultBranding = {
  logo: path.resolve(__dirname, '..', 'default-tenant-assets', 'FOLIO_logo.png'),
  favicon: path.resolve(__dirname, '..', 'default-tenant-assets', 'favicon.ico'),
  name: 'FOLIO University',
};

// Array of above properties whose values will receive the require treatment for webpack
// This should include all image paths except the favicon which the HtmlWebpackPlugin handles
// TODO: Perhaps replace this with a naming convention once branding properties are formalized
const requireMe = [
  'logo',
];

// Currently relies on images being present on the file system
// Future enhancement may support URLs. This may be better suited for a build service.
// TODO: Implement some form of validation
function validatePaths(branding) {
  const assetPath = thePath => path.join('..', thePath);
  return _.mapValues(branding, (value, key) => {
    if (requireMe.includes(key)) {
      return assetPath(value);
    } else {
      return value;
    }
  });
}

// Serialize the branding config.
function serializeBranding(branding) {
  // Wraps image paths with require()'s for webpack to process via its file loaders
  // The require()'s are just strings here so we don't attempt to invoke them right now
  const injectRequire = (key, value) => {
    if (requireMe.includes(key)) {
      return `require('${value}')`;
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

module.exports = class TenantBranding {
  constructor(config) {
    const tenantBranding = validatePaths(config);
    this.branding = Object.assign({}, defaultBranding, tenantBranding);
  }

  virtualModuleString() {
    return serializeBranding(this.branding);
  }

  getFavicon() {
    return this.branding.favicon;
  }
};
