import normalizeInput from './normalizeInput';

export default email => {
  const emailRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const phoneRegExp = /^(\d+[.-]*)+\d+$/;
  const input = normalizeInput(email);
  return phoneRegExp.test(input)
    ? true
    : emailRegExp.test(input);
};