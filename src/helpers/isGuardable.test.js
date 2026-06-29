import isGuardable from './isGuardable';

describe('isGuardable', () => {
  it('returns true for routes other than "/logout"', () => {
    expect(isGuardable('/nowhere-fast')).toBe(true);
    expect(isGuardable('/logout-good')).toBe(true);
    expect(isGuardable('/logout/cheap')).toBe(true);
  });

  it('returns false for "/logout"', () => {
    expect(isGuardable('/logout')).toBe(false);
  });
});
