#!/usr/bin/env node

var commander = require('commander');
var webpack = require('webpack');
var path = require('path');

var cwd = path.resolve();
var cwdModules = path.join(cwd, 'node_modules');

const packageJSON = require ('./package.json');
commander.version(packageJSON.version);

commander
  .command('dev')
  .arguments('<config>')
  .option('--port [port]', 'Port')
  .option('--host [host]', 'Host')
  .description('Launch a webpack-dev-server')
  .action(function (loaderConfigFile) {
    var express = require('express');
    var app = express();

    var config = require('./webpack.config.cli.dev');
    var stripesLoaderConfig = require(path.resolve(loaderConfigFile));
    config.resolve.modules = ['node_modules', cwdModules];
    config.resolveLoader = { modules: ['node_modules', cwdModules] };
    config.plugins.push(new webpack.LoaderOptionsPlugin({
      options: { stripesLoader: stripesLoaderConfig },
    }));
    var compiler = webpack(config);

    var port = commander.port || process.env.STRIPES_PORT || 3000;
    var host = commander.host || process.env.STRIPES_HOST || 'localhost';

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
  .description('Build a tenant bundle')
  .action(function () {
    var config = require('./webpack.config.cli.prod');
    var compiler = webpack(config);
    compiler.run(function (err, stats) { });
  });

commander.parse(process.argv);

// output help if no command specified
if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
