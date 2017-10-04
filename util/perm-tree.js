#!/usr/bin/node

// Prints a tree showing all the permissions in a set, in their
// hierarchical relationships. (Some permissions may appear more than
// once: this happens when a perm is a subpermission of more than one
// parent.)
//
// Must be invoked as
//      $ node perm-tree.js available-permissions.json
// Where available-permissions.json is a file containing the result of
// a WSAPI call such as URL:http://localhost:9130/perms/permissions?length=1000

const fs = require('fs');

function showtree(register, level, key) {
  console.log(`${'  '.repeat(level)}${key}`);

  const perm = register[key];
  if (!perm) {
    console.log(`${'  '.repeat(level + 1)}# ERROR: no definition for '${key}'`);
    return;
  }
  if (perm.subPermissions) {
    for (const subperm of perm.subPermissions) {
      showtree(register, level + 1, (typeof subperm === 'string') ? subperm : subperm.permissionName);
    }
  }
}

const filename = process.argv[2];

fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    return console.log(`cannot read file '${filename}': ${err}`);
  }

  const json = JSON.parse(data);
  const perms = json.permissions;

  console.log(`# total records: reported ${json.totalRecords}, counted: ${perms.length}`);
  const register = {};
  for (const perm of perms) {
    register[perm.permissionName] = perm;
  }

  const parents = {};
  for (const key of Object.keys(register)) {
    const perm = register[key];
    if (perm.subPermissions) {
      for (const subperm of perm.subPermissions) {
        const subpermname = (typeof subperm === 'string') ? subperm : subperm.permissionName;
        parents[subpermname] = key;
      }
    }
  }

  const roots = {};
  for (let key of Object.keys(register)) {
    while (parents[key]) {
      key = parents[key];
    }
    roots[key] = register[key];
  }

  for (const key of Object.keys(roots).sort()) {
    showtree(register, 0, key);
  }

  return undefined; // unused, but ESLint wants it
});
