import { useContext } from 'react';
import { ModulesContext } from '@folio/stripes-shared-context';

export const useModules = () => useContext(ModulesContext);
export { ModulesContext, modulesInitialValue } from '@folio/stripes-shared-context';
