module.exports = {
  test(fn) {
    // We want to transpile files inside node_modules/@folio or outside
    // any node_modules directory. And definitely not files in
    // node_modules outside the @folio namespace even if some parent
    // directory happens to be in @folio.
    //
    // fn is the path after all symlinks are resolved so we need to be
    // wary of all the edge cases yarn link will find for us.
    const nmidx = fn.lastIndexOf('node_modules');
    if (fn.endsWith('.js') && (nmidx === -1 || fn.lastIndexOf('@folio') > nmidx)) return true;
    return false;
  },
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,
    presets: [
      [require.resolve('babel-preset-env'), { modules: false }],
      [require.resolve('babel-preset-stage-2')],
      [require.resolve('babel-preset-react')],
    ],
  },
};
