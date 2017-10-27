const webpack = require('webpack');
const path = require('path');
const StripesConfigPlugin = require('./stripes-config-plugin');

const platformModulePath = path.join(path.resolve(), 'node_modules');

module.exports = function build(stripesConfig, options, callback) {
  const config = require('../webpack.config.cli.prod'); // eslint-disable-line

  config.plugins.push(new StripesConfigPlugin(stripesConfig));
  config.resolve.modules = ['node_modules', platformModulePath];

  if (options.outputPath) {
    config.output.path = path.resolve(options.outputPath);
  }
  if (options.publicPath) {
    config.output.publicPath = options.publicPath;
  }
  // Give the caller a chance to apply their own webpack overrides
  if (options.webpackOverrides && typeof options.webpackOverrides === 'function') {
    options.webpackOverrides(config);
  }

  const compiler = webpack(config);
  compiler.run(callback);
};
