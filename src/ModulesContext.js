import React, { useContext } from 'react';

export const modulesInitialState = {
  app: [],
  handler: [],
  plugin: [],
  settings: [],
};

export const ModulesContext = React.createContext(modulesInitialState);
export default ModulesContext;
export const useModules = () => useContext(ModulesContext);
