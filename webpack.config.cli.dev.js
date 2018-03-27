// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const webpack = require('webpack');
const postCssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postCssCustomProperties = require('postcss-custom-properties');
const postCssCalc = require('postcss-calc');
const postCssNesting = require('postcss-nesting');
const postCssCustomMedia = require('postcss-custom-media');
const postCssMediaMinMax = require('postcss-media-minmax');
const postCssColorFunction = require('postcss-color-function');

const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');

const devConfig = Object.assign({}, base, cli, {
  devtool: 'inline-source-map',
});

devConfig.entry.unshift('webpack-hot-middleware/client');

devConfig.plugins = devConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

devConfig.module.rules.push({
  test: /\.css$/,
  use: [
    {
      loader: 'style-loader',
      options: {
        sourceMap: true,
      },
    },
    {
      loader: 'css-loader',
      options: {
        localIdentName: '[local]---[hash:base64:5]',
        modules: true,
        sourceMap: true,
        importLoaders: 1,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          postCssImport(),
          autoprefixer(),
          postCssCustomProperties(),
          postCssCalc(),
          postCssNesting(),
          postCssCustomMedia(),
          postCssMediaMinMax(),
          postCssColorFunction(),
        ],
        sourceMap: true,
      },
    },
  ],
});

module.exports = devConfig;
