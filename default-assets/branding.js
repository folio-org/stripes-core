// These default branding values are used when no branding is present in stripes.config.js
// Default src are prefixed with '@folio/stripes-core' so they can be imported
// and processed through the webpack loaders from the stripes-core in use.
module.exports = {
  logo: {
    src: '@folio/stripes-core/default-assets/folio-logo.png',
    alt: 'FOLIO University',
  },
  favicon: {
    src: '@folio/stripes-core/default-assets/favicon.ico',
  },
};
