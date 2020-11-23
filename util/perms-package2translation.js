#!/usr/bin/env node

// When invoked with the name of a Stripes module's package file, this
// script emits translation lines for the permission-sets defined in
// the package file, which can be inserted into the module's
// `translations/MODULE-NAME/en.json` translation file.

const fs = require('fs');

if (process.argv.length !== 3) {
  console.error('Usage: perms-package2translation.js package.json');
  process.exit(1);
}

const fileName = process.argv[2];
// console.log('Reading package file', fileName);
const json = fs.readFileSync(fileName);
// console.log(`json = ${json}`);
const obj = JSON.parse(json);
const stripes = obj.stripes;
const permissionSets = stripes.permissionSets;
// console.log('permissionSets =', permissionSets);
permissionSets.forEach(perm => {
  console.log(`  "permission.${perm.permissionName}": "${perm.displayName}",`);
});
