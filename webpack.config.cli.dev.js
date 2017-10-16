// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const webpack = require('webpack');
const path = require('path');
const postCssImport = require('postcss-import');
const postCssUrl = require('postcss-url');
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
  entry: [
    'webpack-hot-middleware/client',
    path.join(__dirname, 'src', 'index'),
  ],
});

devConfig.plugins = devConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

devConfig.module.rules.push({
  test: /\.css$/,
  use: [
    {
      loader: 'style-loader',
    },
    {
      loader: 'css-loader?modules&localIdentName=[local]---[hash:base64:5]',
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          postCssImport(),
          postCssUrl(),
          autoprefixer(),
          postCssCustomProperties(),
          postCssCalc(),
          postCssNesting(),
          postCssCustomMedia(),
          postCssMediaMinMax(),
          postCssColorFunction(),
        ],
      },
    },
  ],
});

module.exports = devConfig;
