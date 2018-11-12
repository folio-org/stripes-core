import validateEmail from '../validateEmail';
import validatePhoneNumber from '../validatePhoneNumber';

const validateForgotUsernameForm = (input) => {
  const normalizedInput = String(input)
    .toLowerCase()
    .trim();

  return validateEmail(normalizedInput) || validatePhoneNumber(normalizedInput);
};

export default validateForgotUsernameForm;
