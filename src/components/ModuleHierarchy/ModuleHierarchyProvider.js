import PropTypes from 'prop-types';

import ModuleHierarchyContext from './ModuleHierarchyContext';
import useModuleHierarchy from './useModuleHierarchy';

const ModuleHierarchyProvider = ({ children, module }) => {
  const moduleHierarchy = useModuleHierarchy();
  const currentModuleHierarchy = [module];

  if (moduleHierarchy) {
    currentModuleHierarchy.unshift(...moduleHierarchy);
  }

  return (
    <ModuleHierarchyContext.Provider value={currentModuleHierarchy}>
      {children}
    </ModuleHierarchyContext.Provider>
  );
};

ModuleHierarchyProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  module: PropTypes.string.isRequired,
};

export default ModuleHierarchyProvider;
