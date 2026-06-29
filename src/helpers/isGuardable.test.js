import isGuardable from './isGuardable';

describe('isGuardable', () => {
  it('returns true for guardable routes', () => {
    expect(isGuardable('/nowhere-fast')).toBe(true);
  });

  it('returns false for unguardable routes', () => {
    expect(isGuardable('/logout')).toBe(false);
    expect(isGuardable('/logout-timeout')).toBe(false);
  });
});
