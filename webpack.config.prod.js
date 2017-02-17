// Common Webpack configuration for building Stripes for production

const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const bootstrapDist = require.resolve('bootstrap/package.json').replace('package.json', 'dist');

module.exports = {
  plugins: [
    // new webpack.optimize.OccurenceOrderPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compressor: {
    //     warnings: false
    //   }
    // }),
    new ExtractTextPlugin({filename: 'global.css', allChunks: true }),
    new CopyWebpackPlugin([
      { from:bootstrapDist, to:'bootstrap'},
      { from: path.join(__dirname, 'index.html'), to:'index.html'},
    ])
  ]
};
