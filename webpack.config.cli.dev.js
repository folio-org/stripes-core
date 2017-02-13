// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');

const bootstrapDist = require.resolve('bootstrap/package.json').replace('package.json', 'dist');

module.exports = Object.assign({}, base, cli, {
  // devtool: 'inline-source-map',
  devtool: false,
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, 'src', 'index')
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin( {
      'OKAPI_URL': false
    } ),
    new ExtractTextPlugin({filename: 'global.css', allChunks: true }),
    new CopyWebpackPlugin([
      { from:bootstrapDist, to:'bootstrap'},
    ])
  ]
});
