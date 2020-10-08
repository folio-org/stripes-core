const packageName = {
  // Expects to follow the scoping rules defined by nodejs: https://docs.npmjs.com/files/package.json#name
  PACKAGE_SCOPE_REGEX: /^@[a-z\d][\w-.]{0,214}\//,
};

export default packageName;
