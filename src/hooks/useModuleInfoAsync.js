import { useState, useEffect } from 'react';
import { useStripes } from '../StripesContext';

/**
 * Canonical path
 * Strip leading slashes and query parameters from paths.
 *
 * @param {string} str path
 * @return {string} canonical path
 */
const canonicalPath = (str) => {
  return `${str.startsWith('/') ? '' : '/'}${str.split('?')[0]}`;
};

/**
 * mapPathToImpl
 * return an object mapping path-strings to interfaces.
 *
 * @param {object} impl object shaped like { id, name, provides }
 * @return {object} mapping of paths to interface objects
 */
const mapPathToImpl = (impl) => {
  const obj = {};
  impl.provides?.forEach(int => {
    int.handlers?.forEach(handler => {
      obj[canonicalPath(handler.pathPattern)] = {
        id: impl.id,
        name: impl.name,
        interface: int.id,
        version: int.version
      };
    });
  });

  return obj;
};

/**
 * useModuleInfoAsync
 * Async version of useModuleInfo that waits for discovery to complete.
 * Given a path, retrieve information about the module from the interfaceProviders.
 *
 * @param {string} path
 * @returns {object} { moduleInfo, loading, error } where moduleInfo is shaped like { id, name, provides } or undefined if no match is found.
 */
const useModuleInfoAsync = (path) => {
  const stripes = useStripes();
  const [moduleInfo, setModuleInfo] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModuleInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get entitlement data asynchronously
        const entitlementData = await stripes.getEntitlementDataAsync();
        
        const paths = entitlementData.interfaceProviders?.reduce((acc, impl) => {
          return { ...acc, ...mapPathToImpl(impl) };
        }, {});

        const result = paths?.[canonicalPath(path)];
        setModuleInfo(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadModuleInfo();
  }, [path, stripes]);

  return { moduleInfo, loading, error };
};

export default useModuleInfoAsync;