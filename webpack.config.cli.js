// Base Webpack configuration for building Stripes at the command line,
// including Stripes configuration.

const path = require('path');
const webpack = require('webpack');

let stripesLoaderConfig;
try {
  stripesLoaderConfig = require('./stripes.config.js');
} catch (err) {
  if (err.message.match(/Cannot find module/)) {
    console.log('Can\'t find "stripes.config.js", using "stripes.config.js.example"');
    stripesLoaderConfig = require('./stripes.config.js.example');
  } else {
    throw err;
  }
}

module.exports = {
  // we want webpack to find src/ relative to where this script lives (__dirname)
  // rather than where it was invoked (.)
  context: __dirname,
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  stripesLoader: stripesLoaderConfig
};
