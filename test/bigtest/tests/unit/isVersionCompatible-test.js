import { expect } from 'chai';
import { isVersionCompatible } from '../../../../src/discoverServices';

function runTest(tests) {
  const title = tests.shift();
  const expected = tests.shift();

  describe(`matching for version ${expected} (${title})`, function () {
    tests.forEach((list, i) => {
      const matches = (i === 0);
      it((matches ? 'accepts good' : 'rejects bad') + ' matches', function () {
        list.forEach((got) => {
          // console.log(i, got);
          expect(isVersionCompatible(got, expected)).to.equal(matches);
        });
      });
    });
  });
}

describe('Unit: isVersionCompatible', function () {
  it('is a function', function () {
    expect(typeof isVersionCompatible).to.equal('function');
  });

  const testCases = [
    [
      'major only',
      '3',
      ['3', '3.5', '3.6', '3.6.1', '3.4', '3.4.7'], // should succeed
      ['2,', '2.9', '4', '4.0', '4.0.0'], // should fail
    ], [
      'major.minor',
      '3.5',
      ['3.5', '3.6', '3.10', '3.6.1'], // should succeed
      ['2.9', '3.4', '3.4.7', '4.0', '4.0.0'], // should fail
    ], [
      'major.minor.trivial',
      '3.5.2',
      ['3.5.2', '3.5.5', '3.5.11', '3.6.1'], // should succeed
      ['2.9', '3.4', '3.4.7', '3.5', '3.5.1', '4.0', '4.0.0'], // should fail
    ], [
      'selection of options',
      '4.0 6.0',
      ['4.0', '4.1', '6.0', '6.3'], // should succeed
      ['3.0', '3.4', '5.0', '5.2', '7.0', '7.12'], // should fail
    ]
  ];

  testCases.forEach((testCase) => {
    runTest(testCase);
  });
});
