// These default branding values are used when no branding is present in stripes.config.js
// Default src are prefixed with '@folio/stripes-core' so they can be imported
// and processed through the webpack loaders from the stripes-core in use.
module.exports = {
  logo: {
    src: `${__dirname}/folio-logo.svg`,
    alt: 'Future Of Libraries Is Open',
  },
  favicon: {
    src: `${__dirname}/favicon.ico`,
  },
};
