const path = require('path');

function tryResolve(modulePath, options) {
  try {
    return require.resolve(modulePath, options);
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
    {
      // The place we normally expect to find this module
      request: path.join(context, 'node_modules', moduleName, ...segments),
    }, {
      // The above resolution is overspecific and prevents some use cases eg. yarn workspaces
      request: path.join(moduleName, ...segments),
    }, {
      // This better incorporates the context path but requires nodejs 9+
      request: path.join(moduleName, ...segments),
      options: { paths: [context] },
    }, {
      // Yarn workspaces fallback: Try node_modules of the parent directory
      request: path.join(context, '..', 'node_modules', moduleName, ...segments),
    },
  ];

  // If we are looking for anything in stripes-core, then we are already there!
  if (moduleName === '@folio/stripes-core') {
    tryPaths.unshift({
      request: path.join(__dirname, '..', ...segments),
    });
  }

  // When available, try for the alias first
  if (alias[moduleName]) {
    tryPaths.unshift({
      request: path.join(alias[moduleName], ...segments),
    });
  }

  for (let i = 0; i < tryPaths.length; i += 1) {
    foundPath = tryResolve(tryPaths[i].request, tryPaths[i].options);
    if (foundPath) {
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
