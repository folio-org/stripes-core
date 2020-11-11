const webpack = require('webpack');
const path = require('path');
const StripesWebpackPlugin = require('./stripes-webpack-plugin');
const applyWebpackOverrides = require('./apply-webpack-overrides');
const logger = require('./logger')();

const platformModulePath = path.join(path.resolve(), 'node_modules');

module.exports = function build(stripesConfig, options) {
  return new Promise((resolve, reject) => {
    logger.log('starting build...');
    let config = require('../webpack.config.cli.prod'); // eslint-disable-line global-require

    if (stripesConfig) {
      config.plugins.push(new StripesWebpackPlugin({ stripesConfig }));
    }

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
    if (options.createDll && options.dllName) {
      config.entry = {};
      config.entry[options.dllName] = options.createDll.split(',');
      config.output.library = '[name]';
      config.output.filename = '[name].[hash].js';
      config.plugins.push(new webpack.DllPlugin({
        name: '[name]',
        path: path.join(options.outputPath, '[name]-manifest.json'),
      }));
    }
    if (options.useDll) {
      // Recommended by https://engineering.invisionapp.com/post/optimizing-webpack/ for performance
      config.cache = true;
      config.devtool = 'eval';
      config.dependencies = options.useDll.split(',');

      for (let dependency in options.dependencies) {
        config.plugins.push(new webpack.DllReferencePlugin({
          context: options.outputPath,
          manifest: require(path.join(options.outputPath, `${dependency}-manifest.json`))
        }));
      }
    }
    if (options.createDll || options.useDll) {
      // When building with Webpack DLL, this alias causes react-dom references to break,
      // so the remedy is to remove it.
      delete config.resolve.alias['react-dom'];
    }

    // By default, Webpack's production mode will configure UglifyJS
    // Override this when we explicity set --no-minify on the command line
    if (options.minify === false) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }

    // Give the caller a chance to apply their own webpack overrides
    config = applyWebpackOverrides(options.webpackOverrides, config);

    logger.log('assign final webpack config', config);
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
