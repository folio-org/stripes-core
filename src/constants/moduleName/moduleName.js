const moduleName = {
  // Expects scoped name that begins with @ followed by
  // alphanumberic characters and _ or -, ending with / (ex: @folio/ OR @library_of_congress/)
  MODULE_SCOPE_REGEX: /^@[a-z0-9_-]+\//,
};

export default moduleName;
