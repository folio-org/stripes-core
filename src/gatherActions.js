// Gather actionNames from all registered modules for hot-key mapping

import { modules } from 'stripes-loader'; // eslint-disable-line
import stripesComponents from '@folio/stripes-components/package.json';

function addKeys(register, list) {
  if (list) {
    for (const actionName of list) {
      register[actionName] = true;
    }
  }
}

export default function gatherActions() {
  const allActions = {};

  for (const key of Object.keys(modules)) {
    const set = modules[key];
    for (const key2 of Object.keys(set)) {
      const module = set[key2];
      addKeys(allActions, module.actionNames);
    }
  }

  addKeys(allActions, stripesComponents.stripes.actionNames);

  return Object.keys(allActions);
}
