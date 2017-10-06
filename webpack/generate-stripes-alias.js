const path = require('path');

function tryResolve(modulePath) {
  try {
    require.resolve(modulePath);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = function generateStripesAlias(moduleName) {
  let alias;
  const platformModule = path.join(path.resolve(), 'node_modules', moduleName);
  const coreModule = path.join(__dirname, '..', 'node_modules', moduleName);
  const fallbackModule = moduleName;

  if (tryResolve(coreModule)) {
    alias = coreModule;
  } else if (tryResolve(platformModule)) {
    alias = platformModule;
  } else {
    alias = fallbackModule;
  }
  return alias;
};
