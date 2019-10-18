const webpack = require('webpack');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const path = require('path');
const nodeObjectHash = require('node-object-hash');
const express = require('express');
const https = require('https');
const fs = require('fs');

const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const connectHistoryApiFallback = require('connect-history-api-fallback');
const StripesWebpackPlugin = require('./stripes-webpack-plugin');
const applyWebpackOverrides = require('./apply-webpack-overrides');
const logger = require('./logger')();

const cwd = path.resolve();
const platformModulePath = path.join(cwd, 'node_modules');
const coreModulePath = path.join(__dirname, '..', 'node_modules');
const serverRoot = path.join(__dirname, '..');

const cachePlugin = new HardSourceWebpackPlugin({
  cacheDirectory: path.join(cwd, 'webpackcache'),
  recordsPath: path.join(cwd, 'webpackcache/records.json'),
  configHash(webpackConfig) {
    // Build a string value used by HardSource to determine which cache to
    // use if [confighash] is in cacheDirectory or if the cache should be
    // replaced if [confighash] does not appear in cacheDirectory.
    return nodeObjectHash().hash(webpackConfig);
  },
});

const serveHttps = (app, host, port) => {
  https
    .createServer({
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
      passphrase: ''
    }, app)
    .listen(port, host, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Listening securely at https://${host}:${port}`);
    });
};

const serveHttp = (app, host, port) => {
  const sslMsg = 'If you want to serve via HTTPS, create a certificate\n' +
    'with the PEM pass phrase "folio" for the Common Name ' +
    '"localhost" with the following command:\n\n' +
    '    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365\n\n' +
    'and copy it into the directory where you ran this command.';
  console.log(sslMsg);

  app.listen(port, host, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Listening at http://${host}:${port}`);
  });
};

module.exports = function serve(stripesConfig, options) {
  if (typeof stripesConfig.okapi !== 'object') throw new Error('Missing Okapi config');
  if (typeof stripesConfig.okapi.url !== 'string') throw new Error('Missing Okapi URL');
  if (stripesConfig.okapi.url.endsWith('/')) throw new Error('Trailing slash in Okapi URL will prevent Stripes from functioning');
  return new Promise((resolve) => {
    logger.log('starting serve...');
    const app = express();
    let config = require('../webpack.config.cli.dev'); // eslint-disable-line global-require

    config.plugins.push(new StripesWebpackPlugin({ stripesConfig }));

    // Look for modules in node_modules, then the platform, then stripes-core
    config.resolve.modules = ['node_modules', platformModulePath, coreModulePath];
    config.resolveLoader = { modules: ['node_modules', platformModulePath, coreModulePath] };

    if (options.cache) {
      config.plugins.push(cachePlugin);
    }
    if (options.devtool) {
      config.devtool = options.devtool;
    }
    // Give the caller a chance to apply their own webpack overrides
    config = applyWebpackOverrides(options.webpackOverrides, config);

    logger.log('assign final webpack config', config);
    const compiler = webpack(config);
    compiler.hooks.done.tap('StripesCoreServe', stats => resolve(stats));

    const port = options.port || process.env.STRIPES_PORT || 3000;
    const host = options.host || process.env.STRIPES_HOST || 'localhost';

    const staticFileMiddleware = express.static(`${serverRoot}/public`);

    app.use(staticFileMiddleware);

    // Process index rewrite before webpack-dev-middleware
    // to respond with webpack's dist copy of index.html
    app.use(connectHistoryApiFallback({
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    }));

    // To handle rewrites without the dot rule, we should include the static middleware twice
    // https://github.com/bripkens/connect-history-api-fallback/blob/master/examples/static-files-and-index-rewrite
    app.use(staticFileMiddleware);

    app.use(webpackDevMiddleware(compiler, {
      logLevel: 'warn',
      stats: 'minimal',
      publicPath: config.output.publicPath,
    }));

    app.use(webpackHotMiddleware(compiler));

    if (fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
      serveHttps(app, host, port);
    } else {
      serveHttp(app, host, port);
    }
  });
};
