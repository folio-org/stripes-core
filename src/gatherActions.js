// Gather actionNames from all registered modules for hot-key mapping

import { modules } from 'stripes-loader'; // eslint-disable-line

export default function gatherActions() {
  const allActions = {};

  for (const key of Object.keys(modules)) {
    const set = modules[key];
    for (const key2 of Object.keys(set)) {
      const module = set[key2];
      const keymap = module.getModule().actionNames;
      if (keymap) {
        for (const actionName of keymap) {
          allActions[actionName] = true;
        }
      }
    }
  }

  return Object.keys(allActions);
}
