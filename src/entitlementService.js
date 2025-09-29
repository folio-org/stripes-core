import { modules } from 'stripes-config';

/**
 * Gets the module configuration data through a Promise interface.
 *
 * Currently returns modules from stripes-config wrapped in Promise.
 * This maintains backward compatibility while providing the Promise-based
 * interface needed for future dynamic loading.
 */
export function getModules() {
  return new Promise(resolve => setTimeout(() => resolve(modules), 100));
}
