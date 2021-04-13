export default phoneNumber => {
  const phoneRegExp = /^\d+([.-]+\d+)*$/;

  return phoneRegExp.test(phoneNumber);
};
