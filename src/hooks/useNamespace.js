import { useModuleHierarchy } from '../components';
import { delimiters } from '../constants';

// A hook which returns module namespace as a string
// https://issues.folio.org/browse/STCOR-537

// Example usage:

// from app module (e.g. ui-users)
// const namespace = useNamespace(); // "@folio/users"

// from plugin embedded in app module (e.g. ui-plugin-find-order executing in ui-agreements)
// const namespace = useNamespace(); // "@folio/agreements:@folio/plugin-find-order"

// from plugin embedded in app module with `ignoreParents` option (e.g. plugin ui-plugin-find-order executing in ui-agreements)
// const namespace = useNamespace({ ignoreParents: true }); // "@folio/plugin-find-order"

// from plugin embedded in app module with `key` option present (e.g. ui-plugin-find-order executing in ui-agreements)
// const namespace = useNamespace({ key: "filters-pane" }); // "@folio/agreements:@folio/plugin-find-order:filters-pane"
const useNamespace = (options = {}) => {
  const moduleHierarchy = useModuleHierarchy();
  const { ignoreParents, key } = options;
  const { NAMESPACE_DELIMITER } = delimiters;
  let namespace = ignoreParents ? moduleHierarchy.pop() : moduleHierarchy.join(NAMESPACE_DELIMITER);

  if (key) {
    namespace += `${NAMESPACE_DELIMITER}${key}`;
  }

  return namespace;
};

export default useNamespace;
