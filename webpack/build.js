const webpack = require('webpack');
const path = require('path');
const StripesConfigPlugin = require('./stripes-config-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const platformModulePath = path.join(path.resolve(), 'node_modules');

module.exports = function build(stripesConfig, options) {
  return new Promise((resolve, reject) => {
    let config = require('../webpack.config.cli.prod'); // eslint-disable-line

    config.plugins.push(new StripesConfigPlugin(stripesConfig));
    config.resolve.modules = ['node_modules', platformModulePath];
    config.resolveLoader = { modules: ['node_modules', platformModulePath] };

    if (options.outputPath) {
      config.output.path = path.resolve(options.outputPath);
    }
    if (options.publicPath) {
      config.output.publicPath = options.publicPath;
    }
    if (options.sourcemap) {
      config.devtool = 'source-map';
    }
    config.plugins.push(new UglifyJSPlugin({
      sourceMap: config.devtool && config.devtool === 'source-map',
    }));

    // Give the caller a chance to apply their own webpack overrides
    if (options.webpackOverrides && typeof options.webpackOverrides === 'function') {
      config = options.webpackOverrides(config);
    }

    const compiler = webpack(config);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};
