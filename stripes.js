#!/usr/bin/env node

const commander = require('commander');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');

const devConfig = require('./webpack.config.cli.dev');

const cwd = path.resolve();
const cwdModules = path.join(cwd, 'node_modules');
const coreModules = path.join(__dirname, 'node_modules');

const packageJSON = require ('./package.json');
commander.version(packageJSON.version);

const cachePlugin = new HardSourceWebpackPlugin({
  cacheDirectory: path.join(cwd, 'webpackcache'),
  recordsPath: path.join(cwd, 'webpackcache/records.json'),
  configHash: function(webpackConfig) {
    // Build a string value used by HardSource to determine which cache to
    // use if [confighash] is in cacheDirectory or if the cache should be
    // replaced if [confighash] does not appear in cacheDirectory.
    return require('node-object-hash')().hash(devConfig);
  },
});

commander
  .command('dev')
  .option('--port [port]', 'Port')
  .option('--host [host]', 'Host')
  .option('--cache', 'Use HardSourceWebpackPlugin cache')
  .option('--devtool [devtool]', 'Use another value for devtool instead of "inline-source-map"')
  .arguments('<config>')
  .description('Launch a webpack-dev-server')
  .action(function (loaderConfigFile, options) {
    const express = require('express');
    const app = express();

    const config = Object.assign({}, devConfig);
    const stripesLoaderConfig = require(path.resolve(loaderConfigFile));
    // Look for modules in node_modules, then the platform, then stripes-core
    config.resolve.modules = ['node_modules', cwdModules, coreModules];
    config.resolveLoader = { modules: ['node_modules', cwdModules, coreModules] };
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      options: { stripesLoader: stripesLoaderConfig },
    }));
    if (options.cache) config.plugins.push(cachePlugin);
    if (options.devtool) config.devtool = options.devtool;
    const compiler = webpack(config);

    const port = options.port || process.env.STRIPES_PORT || 3000;
    const host = options.host || process.env.STRIPES_HOST || 'localhost';

    app.use(express.static(__dirname + '/public'));

    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath
    }));

    app.use(require('webpack-hot-middleware')(compiler));

    app.get('/favicon.ico', function(req, res) {
      res.sendFile(path.join(__dirname, 'favicon.ico'));
    });

    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.listen(port, host, function(err) {
      if (err) {
        console.log(err);
        return;
      }

      console.log('Listening at http://' + host + ':' + port);
    });
  });

commander
  .command('build')
  .arguments('<config> <output>')
  .description('Build a tenant bundle')
  .action(function (loaderConfigFile, outputPath) {
    const config = require('./webpack.config.cli.prod');
    const stripesLoaderConfig = require(path.resolve(loaderConfigFile));
    config.resolve.modules = ['node_modules', cwdModules];
    config.resolveLoader = { modules: ['node_modules', cwdModules] };
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      options: { stripesLoader: stripesLoaderConfig },
    }));
    config.output.path = path.resolve(outputPath);
    const compiler = webpack(config);
    compiler.run(function (err, stats) { });
  });

commander.parse(process.argv);

// output help if no command specified
if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
