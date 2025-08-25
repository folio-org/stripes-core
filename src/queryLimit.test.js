import queryLimit from './queryLimit';

describe('queryLimit', () => {
  it('should return 2000', () => {
    expect(queryLimit()).toBe(2000);
  });
});
