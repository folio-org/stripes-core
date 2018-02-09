#!/usr/bin/env node

/* eslint-disable no-console */

const commander = require('commander');
const path = require('path');
const stripes = require('./webpack/stripes-node-api');
const packageJSON = require('./package.json');

commander.version(packageJSON.version);

// Display error to the console and exit
function processError(err) {
  if (err) {
    console.error(err);
  }
  process.exit(1);
}

// Display webpack output to the console
function processStats(stats) {
  console.log(stats.toString({
    chunks: false,
    colors: true,
  }));
  // Check for webpack compile errors and exit
  if (stats.hasErrors()) {
    processError();
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
    const stripesConfig = require(path.resolve(stripesConfigFile)); // eslint-disable-line
    stripes.serve(stripesConfig, options);
  });

commander
  .command('build')
  .option('--publicPath [publicPath]', 'publicPath')
  .option('--sourcemap', 'include sourcemaps in build')
  .arguments('<config> <output>')
  .description('Build a tenant bundle')
  .action((stripesConfigFile, outputPath, options) => {
    const stripesConfig = require(path.resolve(stripesConfigFile)); // eslint-disable-line
    options.outputPath = outputPath;
    stripes.build(stripesConfig, options)
      .then(stats => processStats(stats))
      .catch(err => processError(err));
  });

commander.parse(process.argv);

// output help if no command specified
if (!process.argv.slice(2).length) {
  commander.outputHelp();
}
