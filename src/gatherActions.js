// Gather actionNames from all registered modules for hot-key mapping

import stripesComponents from '@folio/stripes-components/package';

function addKeys(moduleName, register, list) {
  if (list) {
    for (const actionName of list) {
      // eslint-disable-next-line no-param-reassign
      if (!register[actionName]) register[actionName] = [];
      register[actionName].push(moduleName);
    }
  }
}

export default function gatherActions(modules) {
  const allActions = {};

  for (const key of Object.keys(modules)) {
    const set = modules[key];
    for (const key2 of Object.keys(set)) {
      const module = set[key2];
      addKeys(module.module, allActions, module.actionNames);
    }
  }

  addKeys('stripes-components', allActions, (stripesComponents.stripes || {}).actionNames);

  return Object.keys(allActions);
}
