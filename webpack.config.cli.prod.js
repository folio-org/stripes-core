// Top level Webpack configuration for building static files for
// production deployment from the command line

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
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

const prodConfig = Object.assign({}, base, cli, {
  mode: 'production',
});

prodConfig.plugins = prodConfig.plugins.concat([
  new MiniCssExtractPlugin({ filename: 'style.[contenthash].css', allChunks: true }),
  new OptimizeCssAssetsPlugin(),
]);

prodConfig.module.rules.push({
  test: /\.css$/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: 'css-loader',
      options: {
        localIdentName: '[local]---[hash:base64:5]',
        modules: true,
        importLoaders: 1,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        ident: 'postcss',
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
      },
    },
  ],
});

// Remove all data-test or data-test-* attributes
const babelLoaderConfig = prodConfig.module.rules.find(rule => rule.loader === 'babel-loader');

babelLoaderConfig.options.plugins = (babelLoaderConfig.options.plugins || []).concat([
  [require.resolve('babel-plugin-remove-jsx-attributes'), {
    patterns: ['^data-test.*$']
  }]
]);

module.exports = prodConfig;
