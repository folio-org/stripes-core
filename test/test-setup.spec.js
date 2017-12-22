// Test setup for Mocha tests
// Root-level Mocha hooks defined here apply to all tests regardless of file.

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

before(function () {
  chai.use(sinonChai);
});

beforeEach(function () {
  // The Sinon sandbox allows for easy cleanup of spies and stubs
  this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
  this.sandbox.restore();
});
