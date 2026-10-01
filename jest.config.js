/*
 * const path = require('path');
const config = require('@folio/jest-config-stripes');

module.exports = {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(__dirname, './test/jest/setupFiles.js'),
  ],
};

*/
import path from 'node:path';
import jcs from '@folio/jest-config-stripes';
const { config, axe } = jcs;

export default { 
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(import.meta.dirname, './test/jest/setupFiles.js'),
  ],
};
