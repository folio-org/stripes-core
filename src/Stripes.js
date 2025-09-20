import _ from 'lodash';
import PropTypes from 'prop-types';
import { isVersionCompatible, getEntitlementDataAsync } from './discoverServices';
import { getEntitlementService } from './entitlementService';


export const stripesShape = PropTypes.shape({
  // Properties provided by the class
  clone: PropTypes.func.isRequired,
  hasInterface: PropTypes.func.isRequired,
  getEntitlementDataAsync: PropTypes.func.isRequired,
  hasPerm: PropTypes.func.isRequired,
  hasAnyPerm: PropTypes.func.isRequired,

  // Properties passed into the constructor by the caller
  actionNames: PropTypes.arrayOf(
    PropTypes.string,
  ).isRequired,
  bindings: PropTypes.object,
  config: PropTypes.shape({
    disableAuth: PropTypes.bool,
    hasAllPerms: PropTypes.bool,
    listInvisiblePerms: PropTypes.bool,
    logCategories: PropTypes.string,
    logPrefix: PropTypes.string,
    logTimestamp: PropTypes.bool,
    showHomeLink: PropTypes.bool,
    showPerms: PropTypes.bool,
    tenantOptions: PropTypes.object,
  }).isRequired,
  connect: PropTypes.func.isRequired,
  currency: PropTypes.string,
  discovery: PropTypes.shape({
    interfaces: PropTypes.object,
    isFinished: PropTypes.bool,
    okapi: PropTypes.string,
    modules: PropTypes.object,
  }),
  epics: PropTypes.shape({
    add: PropTypes.func.isRequired,
    middleware: PropTypes.func.isRequired,
  }),
  icons: PropTypes.object,
  locale: PropTypes.string,
  logger: PropTypes.shape({
    log: PropTypes.func.isRequired,
  }).isRequired,
  metadata: PropTypes.object,
  okapi: PropTypes.shape({
    authFailure:  PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    okapiReady: PropTypes.bool,
    tenant: PropTypes.string.isRequired,
    token: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    translations: PropTypes.object,
    url: PropTypes.string.isRequired,
    withoutOkapi: PropTypes.bool,
  }).isRequired,
  plugins: PropTypes.object,
  setBindings: PropTypes.func.isRequired,
  setCurrency: PropTypes.func.isRequired,
  setIsAuthenticated: PropTypes.func.isRequired,
  setLocale: PropTypes.func.isRequired,
  setSinglePlugin: PropTypes.func.isRequired,
  setTimezone: PropTypes.func.isRequired,
  setToken: PropTypes.func.isRequired,
  store: PropTypes.shape({
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    replaceReducer: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
  }),
  timezone: PropTypes.string,
  user: PropTypes.shape({
    perms: PropTypes.object,
    user: PropTypes.shape({
      addresses: PropTypes.arrayOf(PropTypes.object),
      email: PropTypes.string,
      firstName: PropTypes.string,
      id: PropTypes.string.isRequired,
      lastName: PropTypes.string,
      username: PropTypes.string.isRequired,
    }),
  }),
  withOkapi: PropTypes.bool.isRequired,
});


class Stripes {
  constructor(properties) {
    Object.assign(this, properties);
    
    // Initialize the entitlement service if we have a store
    if (this.store) {
      try {
        getEntitlementService(this.store);
      } catch (error) {
        // EntitlementService initialization failed, but we can continue
        // The service will be initialized later when needed
        this.logger?.log('entitlement', 'EntitlementService initialization deferred:', error.message);
      }
    }
  }

  /**
   * hasPerm
   * Return true if user has every permission on the given list; false otherwise.
   * @param {string} perm comma-separated list of permissions
   * @returns boolean
   */
  hasPerm(perm) {
    const logger = this.logger;
    if (this.config && this.config.hasAllPerms) {
      logger.log('perm', `assuming perm '${perm}': hasAllPerms is true`);
      return true;
    }
    if (!this.user.perms) {
      logger.log('perm', `not checking perm '${perm}': no user permissions yet`);
      return undefined;
    }

    const ok = _.every(perm.split(','), p => !!this.user.perms[p]);
    logger.log('perm', `checking perm '${perm}': `, ok);
    return ok;
  }

  /**
   * hasAnyPerm
   * Return true if user has any permission on the given list; false otherwise.
   * @param {string} perm comma-separated list of permissions
   * @returns boolean
   */
  hasAnyPerm(perm) {
    const logger = this.logger;
    if (this.config && this.config.hasAllPerms) {
      logger.log('perm', `assuming perm '${perm}': hasAllPerms is true`);
      return true;
    }
    if (!this.user.perms) {
      logger.log('perm', `not checking perm '${perm}': no user permissions yet`);
      return undefined;
    }

    const ok = _.some(perm.split(','), p => !!this.user.perms[p]);
    logger.log('perm', `checking any perm '${perm}': `, ok);
    return ok;
  }

  /**
   * hasInterface
   * Check if a specific interface is available.
   * Returns synchronously if discovery is complete, or a Promise if discovery is still in progress.
   * 
   * @param {string} name Interface name
   * @param {string} versionWanted Optional version requirement
   * @returns {boolean|string|undefined|Promise<boolean|string|undefined>} 
   *   - If discovery complete: boolean (exists), string (version), undefined (missing), or 0 (incompatible)
   *   - If discovery in progress: Promise that resolves to the above values
   */
  hasInterface(name, versionWanted) {
    const logger = this.logger;
    
    // If discovery data is available, handle synchronously
    if (this.discovery && this.discovery.interfaces) {
      const version = this.discovery.interfaces[name];
      if (!version) {
        logger.log('interface', `interface '${name}' is missing`);
        return undefined;
      }
      if (!versionWanted) {
        logger.log('interface', `interface '${name}' exists`);
        return true;
      }
      const ok = isVersionCompatible(version, versionWanted);
      const cond = ok ? 'is' : 'is not';
      logger.log('interface', `interface '${name}' v${versionWanted} ${cond} compatible with available v${version}`);
      return ok ? version : 0;
    }
    
    // If discovery is not complete and we have a store, return a Promise
    if (this.store) {
      logger.log('interface', `discovery not complete, returning Promise for interface '${name}'`);
      const { getEntitlementService } = require('./entitlementService');
      const service = getEntitlementService(this.store);
      return service.hasInterface(name, versionWanted);
    }
    
    // Fallback for cases where we have no discovery and no store
    logger.log('interface', `not checking interface '${name}': no discovery yet`);
    return undefined;
  }

  /**
   * getDiscovery
   * Access discovery data, returning a Promise if discovery is not yet complete.
   * This provides async access to the same data normally available via this.discovery
   * 
   * @returns {Object|Promise<Object>} Discovery data or Promise that resolves to discovery data
   */
  getDiscovery() {
    // If discovery data is available, return it synchronously
    if (this.discovery && this.discovery.isFinished) {
      return this.discovery;
    }
    
    // If discovery is not complete and we have a store, return a Promise
    if (this.store) {
      return getEntitlementDataAsync(this.store);
    }
    
    // Fallback - return what we have (even if incomplete)
    return this.discovery || {};
  }

  /**
   * getEntitlementDataAsync
   * Returns a Promise that resolves to all entitlement data including applications,
   * interfaces, modules, etc.
   * 
   * @returns {Promise<Object>} Promise that resolves to entitlement data
   */
  getEntitlementDataAsync() {
    return getEntitlementDataAsync(this.store);
  }

  clone(extraProps) {
    return new Stripes(Object.assign({}, this, extraProps));
  }
}

export default Stripes;
