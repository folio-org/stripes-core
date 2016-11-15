// Common Webpack configuration for building Stripes

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: [
    './src/index'
  ],
  resolve: {
    fallback: [
      path.resolve('src'),
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'node_modules/@folio'),
      path.join(__dirname, 'node_modules/@folio-sample-modules')
    ]
  },
  resolveLoader: {
    fallback: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'node_modules/@folio'),
      path.join(__dirname, 'node_modules/@folio-sample-modules')
    ]
  },
  postcss(webpack) {
    return [
      require('postcss-import')({addDependencyTo: webpack}),
      require('postcss-url'),
      require('postcss-cssnext')
    ]
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: [
              require.resolve("babel-preset-es2015"),
              require.resolve("babel-preset-stage-0"),
              require.resolve("babel-preset-react")
          ]
        },
        // We use ES6 for Stripes and rather than have every project include NPM
        // scripts to transpile into ES5, we include them here along with any
        // namespace prefixed @folio which presumably will contain Stripes
        // modules.
        include:  [path.join(__dirname, 'src'), /@folio/, path.join(__dirname, '../dev'), /\/(stripes|ui)-(?!.*\/node_modules\/)/, /\/@folio-sample-modules/]
                                                                                          
        //exclude: [/node_modules/]
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
   	test: /\.(jpg|jpeg|gif|png|ico)$/,
   	loader:'file-loader?name=img/[path][name].[ext]'
      },
      {
        test: /\.css$/,
        loader: 'style!css?modules&localIdentName=[local]---[hash:base64:5]!postcss'
      }
    ]
  }
};
