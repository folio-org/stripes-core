// Test setup for webpack tests
// Root-level Mocha hooks defined here apply to all tests regardless of file.

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

before(function () {
  chai.use(sinonChai);
});

beforeEach(function () {
  // The Sinon sandbox allows for easy cleanup of spies and stubs
  // ...as of v5, sinon's export is a default sandbox
  this.sandbox = sinon;
});

afterEach(function () {
  this.sandbox.restore();
});
