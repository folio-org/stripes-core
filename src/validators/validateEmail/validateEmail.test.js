import validateEmail from './validateEmail';

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(validateEmail('test@example.edu')).toBe(true);
  });

  it('accepts values with comments in username', () => {
    expect(validateEmail('test+comment@example.edu')).toBe(true);
  });

  it('rejects values without @', () => {
    expect(validateEmail('test$example.edu')).toBe(false);
  });

  it('rejects values without domain suffix', () => {
    expect(validateEmail('test@example')).toBe(false);
  });

  it('rejects values with whitespace', () => {
    expect(validateEmail(' test@example.com ')).toBe(false);
  });
});
