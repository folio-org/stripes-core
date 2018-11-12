import normalizeInput from '../normalizeInput';

export default email => {
// eslint-disable-next-line no-useless-escape
  const emailRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const phoneRegExp = /^(\d+[.-]*)+\d+$/;
  const input = normalizeInput(email);
  return phoneRegExp.test(input)
    ? true
    : emailRegExp.test(input);
};
