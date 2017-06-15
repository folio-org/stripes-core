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
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          presets: [
              require.resolve("babel-preset-es2015"),
              require.resolve("babel-preset-stage-2"),
              require.resolve("babel-preset-react")
          ]
        },
        // We use ES6 for Stripes and rather than have every project include NPM
        // scripts to transpile into ES5, we include them here along with any
        // namespace prefixed @folio which presumably will contain Stripes
        // modules. XXX Note that, since WebPack doesn't see the names
        // of symbolic links, only the paths they resolve to, we
        // presently also transpile all modules whose names begin with
        // "stripes-" (which is fine) or "ui-" (which is probably
        // not). We will want to fix this eventually, but it will all
        // change when we move to WebPack 2 so we'll wait till then.
        include:  [path.join(__dirname, 'src'), /@folio/, path.join(__dirname, '../dev'), /[\/\\](stripes|ui)-(?!.*[\/\\]node_modules[\/\\])/, /\/@folio-sample-modules/]
                                                                                          
        //exclude: [/node_modules/]
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
                  require('postcss-cssnext')
                ];
              }
            }
          }
        ]
      }
    ]
  }
};
