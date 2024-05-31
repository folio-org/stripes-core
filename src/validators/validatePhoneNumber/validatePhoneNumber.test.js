import validatePhoneNumber from './validatePhoneNumber';

describe('validatePhoneNumber', () => {
  it('accepts values with numbers only', () => {
    expect(validatePhoneNumber('12')).toBe(true);
  });

  it('accepts values with numbers and dashes', () => {
    expect(validatePhoneNumber('1-2')).toBe(true);
  });

  it('accepts values with numbers and dots', () => {
    expect(validatePhoneNumber('1.2')).toBe(true);
  });

  it('rejects values containing characters other than numbers, dashes, and dots', () => {
    expect(validatePhoneNumber('1.2 ')).toBe(false);
    expect(validatePhoneNumber('1.2a')).toBe(false);
    expect(validatePhoneNumber('1.2!')).toBe(false);
  });
});

