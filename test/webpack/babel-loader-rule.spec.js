const expect = require('chai').expect;
const babelLoaderRule = require('../../webpack/babel-loader-rule');

describe('The babel-loader-rule', function () {
  describe('test condition function', function () {
    beforeEach(function () {
      this.sut = babelLoaderRule.test;
    });

    it('selects files for @folio scoped node_modules', function () {
      const fileName = '/projects/folio/folio-testing-platform/node_modules/@folio/inventory/index.js';
      const result = this.sut(fileName);
      expect(result).to.equal(true);
    });

    it('does not select node_modules files outside of @folio scope', function () {
      const fileName = '/projects/folio/folio-testing-platform/node_modules/lodash/lodash.js';
      const result = this.sut(fileName);
      expect(result).to.equal(false);
    });

    it('only selects .js file extensions', function () {
      const fileName = '/project/folio/folio-testing-platform/node_modules/@folio/search/package.json';
      const result = this.sut(fileName);
      expect(result).to.equal(false);
    });

    it('selects files outside of both @folio scope and node_modules', function () {
      // This test case would hold true for yarn-linked modules, @folio scoped or otherwise
      // Therefore this implies that we are not yarn-linking any non-@folio scoped modules
      const fileName = '/projects/folio/stripes-core/src/configureLogger.js';
      const result = this.sut(fileName);
      expect(result).to.equal(true);
    });

    it('does not select excluded modules', function () {
      const fileName = '/projects/folio/stripes-smart-components/node_modules/@folio/react-githubish-mentions/lib/MentionMenu.js';
      const result = this.sut(fileName);
      expect(result).to.equal(false);
    });
  });
});
