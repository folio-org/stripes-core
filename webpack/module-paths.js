const path = require('path');

function tryResolve(modulePath) {
  try {
    require.resolve(modulePath);
    return true;
  } catch (e) {
    return false;
  }
}

// Generates a resolvable alias for a module with preference given to the
// stripes-core version followed by the platform's, if available
function generateStripesAlias(moduleName) {
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
}

// Common logic to locate a stripes module (pass 'package.json') or file within
function locateStripesModule(context, moduleName, alias, ...segments) {
  let foundPath = false;

  const tryPaths = [
    path.join(context, 'node_modules', moduleName, ...segments), // The place we normally expect to find this module
    path.join(moduleName, ...segments), // The above resolution is overspecific and prevents some use cases eg. yarn workspaces
    path.join(moduleName, ...segments), { paths: [context] }, // This better incorporates the context path but requires nodejs 9+
  ];

  // If we are looking for anything in stripes-core, then we are already there!
  if (moduleName === '@folio/stripes-core') {
    tryPaths.unshift(path.join(__dirname, '..', ...segments));
  }

  // When available, try for the alias first
  if (alias[moduleName]) {
    tryPaths.unshift(path.join(alias[moduleName], ...segments));
  }

  for (let i = 0; i < tryPaths.length; i += 1) {
    const found = tryResolve(tryPaths[i]);
    if (found) {
      foundPath = tryPaths[i];
      break;
    }
  }
  return foundPath;
}

module.exports = {
  tryResolve,
  generateStripesAlias,
  locateStripesModule,
};
