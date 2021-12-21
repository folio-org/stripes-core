import camelCase from 'lodash/camelCase';

// auto-import all mirage submodules

// NOTE: when using webpack 5, you _must_ match on the `./` at the beginning
// of the filename, otherwise webpack will output duplicate filepaths
//
// see: https://github.com/webpack/webpack/issues/12087
const req = require.context('./', true, /\.\/.*\.js$/);
const modules = req.keys().reduce((acc, modulePath) => {
  const moduleParts = modulePath.split('/');
  const moduleType = moduleParts[1];
  const moduleName = moduleParts[2];

  if (moduleName) {
    const moduleKey = camelCase(moduleName.replace('.js', ''));

    return Object.assign(acc, {
      [moduleType]: {
        ...(acc[moduleType] || {}),
        [moduleKey]: req(modulePath).default
      }
    });
  } else if (modulePath === './config.js') {
    return Object.assign(acc, {
      baseConfig: req(modulePath).default,
    });
  } else {
    return acc;
  }
}, {});

export default modules;
