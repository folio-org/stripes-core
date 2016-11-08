// Base Webpack configuration for building Stripes at the command line,
// including Stripes configuration.

const path = require('path');
const webpack = require('webpack');

module.exports = {
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  stripesLoader: {
    okapi: { 'url':'http://localhost:9130', 'tenant':'diku' },
    modules: {
      '@folio-sample-modules/trivial': {}
      // You can also place additional modules that you want to load
      // in the stripes-modules.js file: for an example, see
      // stripes-modules.js.example
    }
  }
};
