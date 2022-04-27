// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');

const esModules = ['@folio', 'ky'].join('|');

module.exports = {
  collectCoverageFrom: [
    '**/(lib|src)/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/test/jest/**',
  ],
  coverageDirectory: './artifacts/coverage-jest/',
  coverageReporters: ['lcov'],
  reporters: ['jest-junit', 'default'],
  transform: { '^.+\\.(js|jsx)$': path.join(__dirname, './test/jest/jest-transformer.js') },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  moduleNameMapper: {
    '^.+\\.(css)$': 'identity-obj-proxy',
    '^.+\\.(svg)$': 'identity-obj-proxy',
  },
  testMatch: ['**/(lib|src)/**/?(*.)test.{js,jsx}'],
  testPathIgnorePatterns: ['/node_modules/', '/test/bigtest/', '/test/ui-testing/'],
  setupFiles: [
    path.join(__dirname, './test/jest/setupTests.js'),
    'jest-canvas-mock'
  ],
  setupFilesAfterEnv: [path.join(__dirname, './test/jest/jest.setup.js')],
};
