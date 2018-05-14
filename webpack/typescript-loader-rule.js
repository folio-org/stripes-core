const path = require('path');

// We want to transpile files inside node_modules/@folio or outside
// any node_modules directory. And definitely not files in
// node_modules outside the @folio namespace even if some parent
// directory happens to be in @folio.
function babelLoaderTest(fileName) {
  const nodeModIdx = fileName.lastIndexOf('node_modules');
  const folioIdx = fileName.lastIndexOf('@folio');

  if (fileName.endsWith('.tsx') && (nodeModIdx === -1 || folioIdx > nodeModIdx)) {
    return true;
  }

  return false;
}

module.exports = {
  test: babelLoaderTest,
  loader: 'awesome-typescript-loader',
  query: {
    configFileName: path.join(__dirname, 'tsconfig.json'),
  },
};
