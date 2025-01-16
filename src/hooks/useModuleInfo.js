import { useQuery } from 'react-query';

import { useStripes } from '../StripesContext';
import { useNamespace } from '../components';
import useOkapiKy from '../useOkapiKy';

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
          paths[handler.pathPattern] = { name: moduleName, impl };
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
 * Given a path, retrieve information about the module that implements it
 * by querying the discovery endpoint /_/proxy/tenants/${tenant}/modules.
 *
 * @param {string} path
 * @returns object shaped like { isFetching, isFetched, isLoading, module }
 */
const useModuleInfo = (path) => {
  const stripes = useStripes();
  const ky = useOkapiKy();
  const [namespace] = useNamespace({ key: `/_/proxy/tenants/${stripes.okapi.tenant}/modules` });
  let paths = {};

  const {
    isFetching,
    isFetched,
    isLoading,
    data,
  } = useQuery(
    [namespace],
    ({ signal }) => {
      return ky.get(
        `/_/proxy/tenants/${stripes.okapi.tenant}/modules?full=true`,
        { signal },
      ).json();
    }
  );

  if (data) {
    data.forEach(impl => {
      paths = { ...paths, ...mapPathToImpl(impl) };
    });
  }

  return ({
    isFetching,
    isFetched,
    isLoading,
    module: paths?.[canonicalPath(path)],
  });
};

export default useModuleInfo;
