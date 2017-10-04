// Top level Webpack configuration for building static files for
// production deployment from the command line

const base = require('./webpack.config.base');
const prod = require('./webpack.config.prod');
const cli = require('./webpack.config.cli');

module.exports = Object.assign({}, base, prod, cli);
