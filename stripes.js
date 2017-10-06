#!/usr/bin/env node

const commander = require('commander');
const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');
const nodeObjectHash = require('node-object-hash');
const express = require('express');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const connectHistoryApiFallback = require('connect-history-api-fallback');

const StripesConfigPlugin = require('./webpack/stripes-config-plugin');
const devConfig = require('./webpack.config.cli.dev');
const prodConfig = require('./webpack.config.cli.prod');

const cwd = path.resolve();
const cwdModules = path.join(cwd, 'node_modules');
const coreModules = path.join(__dirname, 'node_modules');

const packageJSON = require('./package.json');

commander.version(packageJSON.version);

const cachePlugin = new HardSourceWebpackPlugin({
  cacheDirectory: path.join(cwd, 'webpackcache'),
  recordsPath: path.join(cwd, 'webpackcache/records.json'),
  configHash() {
    // Build a string value used by HardSource to determine which cache to
    // use if [confighash] is in cacheDirectory or if the cache should be
    // replaced if [confighash] does not appear in cacheDirectory.
    return nodeObjectHash().hash(devConfig);
  },
});

// Display webpack output to the console
function processStats(err, stats) {
  if (err) {
    console.error(err);
  }
  console.log(stats.toString({
    chunks: false,
    colors: true,
  }));
  // Check for webpack compile errors and exit
  if (err || stats.hasErrors()) {
    process.exit(1);
  }
}

commander
  .command('dev')
  .option('--port [port]', 'Port')
  .option('--host [host]', 'Host')
  .option('--cache', 'Use HardSourceWebpackPlugin cache')
  .option('--devtool [devtool]', 'Use another value for devtool instead of "inline-source-map"')
  .arguments('<config>')
  .description('Launch a webpack-dev-server')
  .action((stripesConfigFile, options) => {
    const app = express();

    const config = Object.assign({}, devConfig);
    const stripesConfig = require(path.resolve(stripesConfigFile)); // eslint-disable-line
    config.plugins.push(new StripesConfigPlugin(stripesConfig));
    // Look for modules in node_modules, then the platform, then stripes-core
    config.resolve.modules = ['node_modules', cwdModules, coreModules];
    config.resolveLoader = { modules: ['node_modules', cwdModules, coreModules] };
    if (options.cache) config.plugins.push(cachePlugin);
    if (options.devtool) config.devtool = options.devtool;
    const compiler = webpack(config);

    const port = options.port || process.env.STRIPES_PORT || 3000;
    const host = options.host || process.env.STRIPES_HOST || 'localhost';

    app.use(express.static(`${__dirname}/public`));

    // Process index rewrite before webpack-dev-middleware
    // to respond with webpack's dist copy of index.html
    app.use(connectHistoryApiFallback({}));

    app.use(webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath,
    }));

    app.use(webpackHotMiddleware(compiler));

    app.get('/favicon.ico', (req, res) => {
      res.sendFile(path.join(__dirname, 'favicon.ico'));
    });

    app.listen(port, host, (err) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log(`Listening at http://${host}:${port}`);
    });
  });

commander
  .command('build')
  .option('--publicPath [publicPath]', 'publicPath')
  .arguments('<config> <output>')
  .description('Build a tenant bundle')
  .action((stripesConfigFile, outputPath, options) => {
    const config = Object.assign({}, prodConfig);
    const stripesConfig = require(path.resolve(stripesConfigFile)); // eslint-disable-line
    config.plugins.push(new StripesConfigPlugin(stripesConfig));
    config.resolve.modules = ['node_modules', cwdModules];
    config.resolveLoader = { modules: ['node_modules', cwdModules] };
    config.output.path = path.resolve(outputPath);
    if (options.publicPath) {
      config.output.publicPath = options.publicPath;
    }
    const compiler = webpack(config);
    compiler.run((err, stats) => {
      processStats(err, stats);
    });
  });

commander.parse(process.argv);

// output help if no command specified
if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
