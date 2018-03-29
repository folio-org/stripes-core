// Top level Webpack configuration for building static files for
// production deployment from the command line

const ExtractTextPlugin = require('extract-text-webpack-plugin');
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

const prodConfig = Object.assign({}, base, cli);

prodConfig.plugins = prodConfig.plugins.concat([
  new ExtractTextPlugin({ filename: 'style.[contenthash].css', allChunks: true }),
  new OptimizeCssAssetsPlugin(),
]);

prodConfig.module.rules.push({
  test: /\.css$/,
  use: ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: [
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
  }),
});

module.exports = prodConfig;
