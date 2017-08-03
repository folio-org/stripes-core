// Common Webpack configuration for building Stripes

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

// React doesn't like being included multiple times as can happen when using
// yarn link. Here we find a more specific path to it by first looking in
// stripes-core (__dirname) before falling back to the platform or simply react
let specificReact = path.join(__dirname, 'node_modules', 'react');
try {
  require.resolve(specificReact);
} catch (e) {
  specificReact = 'react';
}

module.exports = {
  entry: [
    path.join(__dirname, 'src', 'index')
  ],
  resolve: {
    alias: {
      'stripes-loader': '@folio/stripes-loader',
      'react': specificReact,
    }
  },
  module: {
    rules: [
      {
        test: function (inp) {
          if (inp.includes('stripes-loader')) return true;
        },
        use: [{
          loader: '@folio/stripes-loader',
          options: { shenanigans: 'TODO: why doesn\'t this work?' }
        }]
      },
      {
        test: function (fn) {
          // We want to transpile files inside node_modules/@folio or outside
          // any node_modules directory. And definitely not files in
          // node_modules outside the @folio namespace even if some parent
          // directory happens to be in @folio.
          //
          // fn is the path after all symlinks are resolved so we need to be
          // wary of all the edge cases yarn link will find for us.
          const nmidx = fn.lastIndexOf('node_modules')
          if (fn.endsWith('.js') && (nmidx === -1 || fn.lastIndexOf('@folio') > nmidx)) return true 
        },
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
            [require.resolve("babel-preset-es2015"), { modules: false }],
            [require.resolve("babel-preset-stage-2")],
            [require.resolve("babel-preset-react")]
          ]
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
   	test: /\.(jpg|jpeg|gif|png|ico)$/,
   	loader:'file-loader?name=img/[path][name].[ext]'
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader?modules&localIdentName=[local]---[hash:base64:5]'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('postcss-import'),
                  require('postcss-url'),
                  require("autoprefixer"),
                  require("postcss-custom-properties"),
                  require("postcss-calc"),
                  require("postcss-nesting"),
                  require("postcss-custom-media"),
                  require("postcss-media-minmax"),
                  require("postcss-color-function")
                ];
              }
            }
          }
        ]
      }
    ]
  }
};
