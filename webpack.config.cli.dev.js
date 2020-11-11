// Top level Webpack configuration for running a development environment
// from the command line via devServer.js

const path = require('path');
const webpack = require('webpack');
const postCssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postCssCustomProperties = require('postcss-custom-properties');
const postCssCalc = require('postcss-calc');
const postCssNesting = require('postcss-nesting');
const postCssCustomMedia = require('postcss-custom-media');
const postCssMediaMinMax = require('postcss-media-minmax');
const postCssColorFunction = require('postcss-color-function');
const { generateStripesAlias } = require('./webpack/module-paths');

const base = require('./webpack.config.base');
const cli = require('./webpack.config.cli');

const devConfig = Object.assign({}, base, cli, {
  devtool: 'inline-source-map',
  mode: 'development',
});

// Override filename to remove the hash in development due to memory issues (STCOR-296)
devConfig.output.filename = 'bundle.js';

devConfig.entry.unshift('webpack-hot-middleware/client');

devConfig.plugins = devConfig.plugins.concat([
  new webpack.HotModuleReplacementPlugin(),
]);

devConfig.module.rules.push({
  test: /\.css$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader',
      options: {
        localIdentName: '[local]---[hash:base64:5]',
        modules: true,
        sourceMap: true,
        importLoaders: 1,
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        plugins: () => [
          postCssImport(),
          autoprefixer(),
          postCssCustomProperties({
            preserve: false,
            importFrom: [path.join(generateStripesAlias('@folio/stripes-components'), 'lib/variables.css')]
          }),
          postCssCalc(),
          postCssNesting(),
          postCssCustomMedia(),
          postCssMediaMinMax(),
          postCssColorFunction(),
        ],
        sourceMap: true,
      },
    },
  ],
});

devConfig.module.rules.push(
  {
    test: /\.svg$/,
    use: [{ loader: 'file-loader?name=img/[path][name].[hash].[ext]' }]
  },
);

module.exports = devConfig;
