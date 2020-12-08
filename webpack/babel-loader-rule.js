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
      [require.resolve('@babel/preset-env'), { targets: '> 0.25%, not dead' }],
      [require.resolve('@babel/preset-flow'), { all: true }],
      [require.resolve('@babel/preset-react')],
      [require.resolve('@babel/preset-typescript')],
    ],
    plugins: [
      [require.resolve('@babel/plugin-proposal-decorators'), { 'legacy': true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { 'loose': true }],
      [require.resolve('@babel/plugin-proposal-export-namespace-from')],
      [require.resolve('@babel/plugin-proposal-function-sent')],
      [require.resolve('@babel/plugin-proposal-numeric-separator')],
      [require.resolve('@babel/plugin-proposal-throw-expressions')],
      [require.resolve('@babel/plugin-syntax-import-meta')],
      [require.resolve('react-hot-loader/babel')],
    ]
  },
};
