import path from 'node:path'; // = require('path');
import jcs from '@folio/jest-config-stripes';

const { config } = jcs;

export default  {
  ...config,
  setupFiles: [
    ...config.setupFiles,
    path.join(import.meta.dirname, './test/jest/setupFiles.js'),
  ],
};
