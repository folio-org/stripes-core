// Common Webpack configuration for building Stripes
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { generateStripesAlias } = require('./webpack/module-paths');
const babelLoaderRule = require('./webpack/babel-loader-rule');
const StripesDuplicatesPlugin = require('./webpack/stripes-duplicate-plugin');

// React doesn't like being included multiple times as can happen when using
// yarn link. Here we find a more specific path to it by first looking in
// stripes-core (__dirname) before falling back to the platform or simply react
const specificReact = generateStripesAlias('react');

module.exports = {
  entry: [
    'typeface-source-sans-pro',
    '@folio/stripes-components/lib/global.css',
    path.join(__dirname, 'src', 'index'),
  ],
  resolve: {
    alias: {
      'stripes-loader': 'stripes-config', // TODO: Remove this alias after UI module references have been updated
      'react': specificReact,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname}/index.html`,
    }),
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new StripesDuplicatesPlugin(),
  ],
  module: {
    rules: [
      babelLoaderRule,
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(jpg|jpeg|gif|png|ico|svg)$/,
        loader: 'file-loader?name=img/[path][name].[hash].[ext]',
      },
      {
        test: /\.(woff2?)$/,
        loader: 'file-loader?name=fonts/[name].[hash].[ext]',
      },
    ],
  },
};
