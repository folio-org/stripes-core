import React, { createContext, useContext, useState, useEffect } from 'react';
import { modules as staticModules } from 'stripes-config';

// Create contexts for both sync and async access
export const ModulesContext = React.createContext(staticModules);

// Async modules context
export const AsyncModulesContext = createContext({
  modules: null,
  loading: true,
  error: null
});

/**
 * ModulesProvider that provides async access to modules data
 * This simulates async loading even for static config to maintain consistency
 * with the async entitlement pattern
 */
export const AsyncModulesProvider = ({ children, entitlementService }) => {
  const [state, setState] = useState({
    modules: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadModules = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // If we have an entitlement service, try to get dynamic modules data
        if (entitlementService) {
          const entitlementData = await entitlementService.getEntitlements();
          // Check if we have dynamic modules data, otherwise fall back to static
          const modules = entitlementData.modules || staticModules;
          setState({ modules, loading: false, error: null });
        } else {
          // For now, return static modules but wrapped in Promise to maintain async interface
          await new Promise(resolve => setTimeout(resolve, 0)); // Simulate async
          setState({ modules: staticModules, loading: false, error: null });
        }
      } catch (error) {
        setState({ 
          modules: staticModules, // Fall back to static modules on error
          loading: false, 
          error: error.message 
        });
      }
    };

    loadModules();
  }, [entitlementService]);

  return (
    <AsyncModulesContext.Provider value={state}>
      {children}
    </AsyncModulesContext.Provider>
  );
};

// Hook for synchronous modules access (backward compatibility)
export const useModules = () => useContext(ModulesContext);

// Hook for asynchronous modules access
export const useModulesAsync = () => {
  const context = useContext(AsyncModulesContext);
  if (context === undefined) {
    throw new Error('useModulesAsync must be used within an AsyncModulesProvider');
  }
  return context;
};

// Export static modules for backward compatibility
export { staticModules as originalModules };
export default ModulesContext;