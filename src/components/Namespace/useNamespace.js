import { useModuleHierarchy } from '../ModuleHierarchy';
import { delimiters } from '../../constants';

// A hook which returns module namespace as a string
// https://issues.folio.org/browse/STCOR-537

// const [namespace, getNamespace] = useNamespace();

// Example usage:

// from app module (e.g. ui-users)
// const [namespace] = useNamespace(); // "@folio/users"

// from app module (e.g. ui-users) via getNamespace
// const [_, getNamespace] = useNamespace();
// const namespace = getNamespace({ key: 'test-key' }) // "@folio/users:test-key"

// from plugin embedded in app module (e.g. ui-plugin-find-order executing in ui-agreements)
// const [namespace] = useNamespace(); // "@folio/agreements:@folio/plugin-find-order"

// from plugin embedded in app module with `ignoreParents` option (e.g. plugin ui-plugin-find-order executing in ui-agreements)
// const [namespace] = useNamespace({ ignoreParents: true }); // "@folio/plugin-find-order"

// from plugin embedded in app module with `key` option present (e.g. ui-plugin-find-order executing in ui-agreements)
// const [namespace] = useNamespace({ key: "filters-pane" }); // "@folio/agreements:@folio/plugin-find-order:filters-pane"


const useNamespace = (options = {}) => {
  const moduleHierarchy = useModuleHierarchy();
  const getNamespace = (opts) => {
    const { ignoreParents, key } = opts;
    const { NAMESPACE_DELIMITER } = delimiters;

    let namespace = ignoreParents ? moduleHierarchy.pop() : moduleHierarchy.join(NAMESPACE_DELIMITER);

    if (key) {
      namespace += `${NAMESPACE_DELIMITER}${key}`;
    }

    return namespace;
  };

  const namespace = getNamespace(options);

  return [namespace, getNamespace];
};

export default useNamespace;
