import { useContext } from 'react';

import ModuleHierarchyContext from './ModuleHierarchyContext';

const useCurrentModule = () => useContext(ModuleHierarchyContext);

export default useCurrentModule;
