import PropTypes from 'prop-types';

import ModuleHierarchyContext from './ModuleHierarchyContext';
import useModuleHierarchy from './useModuleHierarchy';

const ModuleHierarchyProvider = ({ children, module }) => {
  const moduleHierarchy = useModuleHierarchy();
  const currentModuleHierarchy = (!moduleHierarchy) ?
    [module.module] :
    [...moduleHierarchy, module.module];

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
  module: PropTypes.object.isRequired,
};

export default ModuleHierarchyProvider;