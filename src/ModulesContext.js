import React, { useContext } from 'react';
import { modules } from 'stripes-config';

export const ModulesContext = React.createContext(modules);
export default ModulesContext;
export const useModules = () => useContext(ModulesContext);
export { modules as originalModules };
