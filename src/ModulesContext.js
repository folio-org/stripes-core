import { useContext } from 'react';
import { ModulesContext } from '@folio/stripes-shared-context';

export { ModulesContext };
export default ModulesContext;
export const useModules = () => useContext(ModulesContext);
