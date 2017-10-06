const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');

// Module names that must not have duplicates
const duplicatesNotAllowed = [
  'react',
];

// Module names that are acceptable to have duplicates
const duplicatesAllowed = [
];

function StripesDuplicatePlugin() {}

StripesDuplicatePlugin.prototype.apply = (compiler) => {
  // This will surface duplicates as warnings
  compiler.apply(new DuplicatePackageCheckerPlugin({
    exclude: instance => duplicatesAllowed.includes(instance.name),
  }));

  // This will error when duplicates of specific modules are found
  compiler.apply(new DuplicatePackageCheckerPlugin({
    exclude: instance => !duplicatesNotAllowed.includes(instance.name),
    verbose: true,
    emitError: true,
  }));
};

module.exports = StripesDuplicatePlugin;
