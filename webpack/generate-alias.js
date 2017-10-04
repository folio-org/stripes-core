const path = require('path');

function tryResolve(path){
  try {
      require.resolve(path);
      return true;
  } catch (e) {
      return false;
  }
}

module.exports = function generateReactAlias() {
  let specificReact;
  const platformReact = path.join(path.resolve(), 'node_modules', 'react');
  const coreReact = path.join(__dirname, '..', 'node_modules', 'react');
  const fallbackReact = 'react';
  
  if ( tryResolve(coreReact)) {
    specificReact = coreReact;
  } else if ( tryResolve(platformReact)) {
    specificReact = platformReact;
  } else {
    specificReact = fallbackReact;
  }
  return specificReact;
}
