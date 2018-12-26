const signToShow = '*';

const replacer = (string, pattern1, pattern2) => (
  pattern1.concat(signToShow.repeat(pattern2.length))
);

/**
 * A function to hide the eternal user email and show it according to the following rules:
 *  - show first two characters for the local-part
 *  - show first character of the domain
 *  - show the dot
 * Each replacement step performs formatting as it mentioned above
 * @param email      - an email to be formatted
 * @returns {string} - a formatted email string
 */
const hideEmail = email => (
  email
    .replace(/(^.{2})(.+?)(?=@)/g, replacer)
    .replace(/(^.+@.)(.+?)(?=\.)/g, replacer)
    .replace(/(\.)(.+?)(?=$)/g, replacer)
);

export default hideEmail;
