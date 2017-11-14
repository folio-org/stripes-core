// Common Webpack configuration for building Stripes

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const generateStripesAlias = require('./webpack/generate-stripes-alias');

// React doesn't like being included multiple times as can happen when using
// yarn link. Here we find a more specific path to it by first looking in
// stripes-core (__dirname) before falling back to the platform or simply react
const specificReact = generateStripesAlias('react');

module.exports = {
  entry: [
    'typeface-source-sans-pro',
    path.join(__dirname, 'src', 'index'),
  ],
  resolve: {
    alias: {
      'stripes-loader': 'stripes-config', // TODO: Remove this alias after UI module references have been updated
      react: specificReact,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${__dirname}/index.html`,
    }),
  ],
  module: {
    rules: [
      {
        test(fn) {
          // We want to transpile files inside node_modules/@folio or outside
          // any node_modules directory. And definitely not files in
          // node_modules outside the @folio namespace even if some parent
          // directory happens to be in @folio.
          //
          // fn is the path after all symlinks are resolved so we need to be
          // wary of all the edge cases yarn link will find for us.
          const nmidx = fn.lastIndexOf('node_modules');
          if (fn.endsWith('.js') && (nmidx === -1 || fn.lastIndexOf('@folio') > nmidx)) return true;
          return false;
        },
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            [require.resolve('babel-preset-env'), { modules: false }],
            [require.resolve('babel-preset-stage-2')],
            [require.resolve('babel-preset-react')],
          ],
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(jpg|jpeg|gif|png|ico)$/,
        loader: 'file-loader?name=img/[path][name].[hash].[ext]',
      },
      {
        test: /\.(woff2?)$/,
        loader: 'file-loader?name=fonts/[name].[hash].[ext]',
      },
    ],
  },
};
