import validateForgotUsernameForm from './validateForgotUsernameForm';

describe('validateForgotUsernameForm', () => {
  describe('accepts valid email addresses and phone numbers', () => {
    it('accepts valid email addresses', () => {
      expect(validateForgotUsernameForm('test@example.edu')).toBe(true);
    });

    it('accepts values with comments in username', () => {
      expect(validateForgotUsernameForm('test+comment@example.edu')).toBe(true);
    });

    it('accepts values with numbers only', () => {
      expect(validateForgotUsernameForm('12')).toBe(true);
    });

    it('accepts values with numbers and dashes', () => {
      expect(validateForgotUsernameForm('1-2')).toBe(true);
    });

    it('accepts values with numbers and dots', () => {
      expect(validateForgotUsernameForm('1.2')).toBe(true);
    });
  });

  it('rejects values that are not valid email addresses or phone numbers', () => {
    // validateForgotUsernameForm trims whitespace so we don't test for
    // whitespace rejection here, even though other validators do.
    expect(validateForgotUsernameForm('not an email address')).toBe(false);
    expect(validateForgotUsernameForm('not a phone number')).toBe(false);
    expect(validateForgotUsernameForm('test$example.edu')).toBe(false);
    expect(validateForgotUsernameForm('test@example')).toBe(false);
    expect(validateForgotUsernameForm('1.2a')).toBe(false);
    expect(validateForgotUsernameForm('1.2!')).toBe(false);
  });
});
