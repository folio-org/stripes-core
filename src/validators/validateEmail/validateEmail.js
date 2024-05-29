/**
 * validate an email address
 * Email address validation is notoriously difficult. I don't know where this
 * particular regex came from but it shares substantially with well-known
 * versions such as https://emailregex.com/ and does a good enough job for us.
 *
 * This was introduced in STCOR-276/PR #496
 */
export default email => {
  // eslint-disable-next-line no-useless-escape
  const emailRegExp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  return emailRegExp.test(email);
};
