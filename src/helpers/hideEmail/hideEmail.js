const signToShow = '*';

const replacer = (string, pattern1, pattern2) => (
  pattern1.concat(signToShow.repeat(pattern2.length))
);

const hideEmail = email => (
  email
    .replace(/(^.{2})(.+?)(?=@)/g, replacer)
    .replace(/(^.+@.)(.+?)(?=\.)/g, replacer)
    .replace(/(\.)(.+?)(?=$)/g, replacer)
);

export default hideEmail;
