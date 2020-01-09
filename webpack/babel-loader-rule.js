const path = require('path');

// These modules are already transpiled and should be excluded
const folioScopeBlacklist = [
  'react-githubish-mentions',
].map(segment => path.join('@folio', segment));

// We want to transpile files inside node_modules/@folio or outside
// any node_modules directory. And definitely not files in
// node_modules outside the @folio namespace even if some parent
// directory happens to be in @folio.
//
// fn is the path after all symlinks are resolved so we need to be
// wary of all the edge cases yarn link will find for us.
function babelLoaderTest(fileName) {
  const nodeModIdx = fileName.lastIndexOf('node_modules');
  if (fileName.endsWith('.js')
    && (nodeModIdx === -1 || fileName.lastIndexOf('@folio') > nodeModIdx)
    && (folioScopeBlacklist.findIndex(ignore => fileName.includes(ignore)) === -1)) {
    return true;
  }
  return false;
}

module.exports = {
  test: babelLoaderTest,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: [
      ['@babel/preset-env'],
      ['@babel/preset-flow', { all: true }],
      ['@babel/preset-react'],
      ['@babel/preset-typescript'],
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-throw-expressions',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      ['react-hot-loader/babel'],
    ]
  },
};
