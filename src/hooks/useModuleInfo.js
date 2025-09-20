import { useState, useEffect } from 'react';
import { useStripes } from '../StripesContext';
import { entitlementService } from '../discoverServices';

/**
 * map a module implementation string to a module-name, hopefully.
 * given a string like "mod-users-16.2.0-SNAPSHOT.127" return "mod-users"
 */
const implToModule = (impl) => {
  const moduleName = impl.match(/^(.*)-[0-9]+\.[0-9]+\.[0-9]+.*/);
  return moduleName[1] ? moduleName[1] : '';
};

/**
 * mapPathToImpl
 * Remap the input datastructure from an array of modules (containing
 * details about the interfaces they implement, and the paths handled by
 * each interface) to a map from path to module.
 *
 * i.e. map from sth like
 * [{
 *   provides: {
 *     handlers: [
 *       { pathPattern: "/foo", ... }
 *       { pathPattern: "/bar", ... }
 *     ]
 *   }
 * }, ... ]
 * to
 * {
 *   foo: { ...impl },
 *   bar: { ...impl },
 * }
 * @param {object} impl
 * @returns object
 */
const mapPathToImpl = (impl) => {
  const moduleName = implToModule(impl.id);
  const paths = {};
  if (impl.provides) {
    // not all interfaces actually implement routes, e.g. edge-connexion
    // so those must be filtered out
    impl.provides.filter(i => i.handlers).forEach(i => {
      i.handlers.forEach(handler => {
        if (!paths[handler.pathPattern]) {
          paths[handler.pathPattern] = { ...impl, name: moduleName };
        }
      });
    });
  }
  return paths;
};

/**
 * canonicalPath
 * Prepend a leading / if none is present.
 * Strip everything after ?
 * @param {string} str a string that represents a portion of a URL
 * @returns {string}
 */
const canonicalPath = (str) => {
  return `${str.startsWith('/') ? '' : '/'}${str.split('?')[0]}`;
};

/**
 * useModuleInfo
 * Given a path, retrieve information about the module from the interfaceProviders.
 *
 * @param {string} path
 * @returns {object} object shaped like { id, name, provides } or undefined if no match is found.
 */
const useModuleInfo = (path) => {
  const stripes = useStripes();
  const [moduleInfo, setModuleInfo] = useState(null);

  useEffect(() => {
    const loadModuleInfo = async () => {
      try {
        const interfaceProviders = await entitlementService.getInterfaceProviders();
        
        const paths = interfaceProviders?.reduce((acc, impl) => {
          return { ...acc, ...mapPathToImpl(impl) };
        }, {});

        setModuleInfo(paths?.[canonicalPath(path)]);
      } catch (error) {
        console.error('Failed to load interface providers in useModuleInfo:', error);
        // Fallback to sync access
        const paths = stripes.discovery?.interfaceProviders?.reduce((acc, impl) => {
          return { ...acc, ...mapPathToImpl(impl) };
        }, {});
        setModuleInfo(paths?.[canonicalPath(path)]);
      }
    };

    loadModuleInfo();
  }, [path, stripes.discovery]);

  return moduleInfo;
};

export default useModuleInfo;
