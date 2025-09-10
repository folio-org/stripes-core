import React, { useContext, useState, useEffect } from 'react';
import { getModules, legacyModules } from './entitlementService';

export const ModulesContext = React.createContext(legacyModules);
export default ModulesContext;

// Legacy hook for immediate synchronous access (backwards compatibility)
export const useModules = () => useContext(ModulesContext);

// New async hook for Promise-based access
export const useModulesAsync = () => {
  const [modules, setModules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModules()
      .then(moduleData => {
        setModules(moduleData);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { modules, loading, error };
};

export { legacyModules as originalModules };
