import 'babel-polyfill';

// require all modules ending in "-test" from the BigTest tests directory and
// all subdirectories
const requireTest = require.context('./tests/', true, /-test/);
requireTest.keys().forEach(requireTest);
