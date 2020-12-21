import {
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { packageName } from '../../../src/constants';

describe('The package-name-rule', function () {
  describe('Test package scope name regex rules', function () {
    it('accepts @folio scoped name', function () {
      const result = '@folio/test-core'.match(packageName.PACKAGE_SCOPE_REGEX);
      expect(result[0]).to.equal('@folio/');
    });

    it('accepts @library_of_congress scoped name', function () {
      const result = '@library_of_congress/loc-core'.match(packageName.PACKAGE_SCOPE_REGEX);
      expect(result[0]).to.equal('@library_of_congress/');
    });

    it('rejects @-illegal-name scoped name', function () {
      const result = '@-illegal-name/something'.match(packageName.PACKAGE_SCOPE_REGEX);
      expect(result).to.equal(null);
    });

    it('rejects scoped name that exceeds 214 character limit', function () {
      const result = '@name-that-is-way-too-long-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/end'.match(packageName.PACKAGE_SCOPE_REGEX);
      expect(result).to.equal(null);
    });
  });
});
