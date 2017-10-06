// Common Webpack configuration for building Stripes

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
const generateStripesAlias = require('./webpack/generate-stripes-alias');

// React doesn't like being included multiple times as can happen when using
// yarn link. Here we find a more specific path to it by first looking in
// stripes-core (__dirname) before falling back to the platform or simply react
const specificReact = generateStripesAlias('react');

module.exports = {
  entry: [
    path.join(__dirname, 'src', 'index'),
  ],
  resolve: {
    alias: {
      'stripes-loader': 'stripes-config', // TODO: Remove this alias after UI module references have been updated
      react: specificReact,
    },
  },
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
        loader: 'file-loader?name=img/[path][name].[ext]',
      },
      {
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
              plugins() {
                return [
                  postCssImport,
                  postCssUrl,
                  autoprefixer,
                  postCssCustomProperties,
                  postCssCalc,
                  postCssNesting,
                  postCssCustomMedia,
                  postCssMediaMinMax,
                  postCssColorFunction,
                ];
              },
            },
          },
        ],
      },
    ],
  },
};
