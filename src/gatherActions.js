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

export default function gatherActions() {
  const allActions = {};
  addKeys('stripes-components', allActions, (stripesComponents.stripes || {}).actionNames);

  return Object.keys(allActions);
}
