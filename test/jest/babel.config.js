const { babelOptions } = require('@folio/stripes-cli');

babelOptions.plugins.push([
  'babel-plugin-module-resolver',
  {
    root: ['./'],
    alias: {
      __mock__: './test/jest/__mock__',
      fixtures: './test/jest/fixtures',
      helpers: './test/jest/helpers',
    },
  },
]);

module.exports = {
  ...babelOptions,
};
