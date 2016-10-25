// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');

module.exports = Object.assign({}, base, cli, {
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client',
    './src/index'
  ],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin( {
      'OKAPI_URL': false
    } ),
    new ExtractTextPlugin('global.css', {
      allChunks: true
    }),
    new CopyWebpackPlugin([
      { from:'node_modules/bootstrap/dist', to:'bootstrap'},
    ])
  ]
});
