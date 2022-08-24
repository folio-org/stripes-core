const path = require('path');

const config = {
  entry: path.resolve('./index.js'),
  output: {
    library: {
      type: 'umd',
      name: '@folio/stripes-core',
    },
  },
};

module.exports = config;
