/* global require */

let start = () => {}; // eslint-disable-line import/no-mutable-exports

if (process.env.NODE_ENV !== 'production') {
  start = require('./start').default; // eslint-disable-line global-require
}

export default start;
