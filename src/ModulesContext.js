import { useContext, createContext } from 'react';

export const modulesInitialValue = {
  app: [],
  handler: [],
  plugin: [],
  settings: [],
};

export const ModulesContext = createContext(modulesInitialValue);

export const useModules = () => useContext(ModulesContext);
