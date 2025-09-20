import { config } from 'stripes-config';

/**
 * EntitlementService
 * 
 * Provides Promise-based access to entitlement data. This service abstracts the 
 * synchronous discovery mechanism and makes it asynchronous to support future 
 * dynamic loading scenarios.
 * 
 * The service maintains backward compatibility by checking if discovery has finished
 * and either returns resolved data or waits for discovery to complete.
 */
class EntitlementService {
  constructor(store) {
    this.store = store;
    this.discoveryPromise = null;
    this.listeners = new Set();
  }

  /**
   * Get entitlement data as a Promise
   * @returns {Promise<Object>} Promise that resolves to entitlement data
   */
  getEntitlements() {
    return new Promise((resolve, reject) => {
      const state = this.store.getState();
      const discovery = state.discovery || {};

      // If discovery is already finished, return the data immediately
      if (discovery.isFinished) {
        resolve(this._formatEntitlementData(discovery));
        return;
      }

      // If discovery is in progress, wait for it to complete
      this._waitForDiscovery()
        .then(() => {
          const finalState = this.store.getState();
          resolve(this._formatEntitlementData(finalState.discovery || {}));
        })
        .catch(reject);
    });
  }

  /**
   * Get application data as a Promise
   * @returns {Promise<Object>} Promise that resolves to applications data
   */
  getApplications() {
    return this.getEntitlements().then(data => data.applications || {});
  }

  /**
   * Get interfaces data as a Promise
   * @returns {Promise<Object>} Promise that resolves to interfaces data
   */
  getInterfaces() {
    return this.getEntitlements().then(data => data.interfaces || {});
  }

  /**
   * Get modules data as a Promise
   * @returns {Promise<Object>} Promise that resolves to modules data
   */
  getModules() {
    return this.getEntitlements().then(data => data.modules || {});
  }

  /**
   * Check if a specific interface is available
   * @param {string} interfaceName - Name of the interface to check
   * @param {string} version - Optional version requirement
   * @returns {Promise<boolean|string>} Promise that resolves to availability status
   */
  hasInterface(interfaceName, version) {
    return this.getInterfaces().then(interfaces => {
      const availableVersion = interfaces[interfaceName];
      if (!availableVersion) {
        return false;
      }
      if (!version) {
        return true;
      }
      // Use the existing version compatibility check
      const { isVersionCompatible } = require('./discoverServices');
      return isVersionCompatible(availableVersion, version) ? availableVersion : false;
    });
  }

  /**
   * Wait for discovery to complete
   * @private
   * @returns {Promise<void>} Promise that resolves when discovery is finished
   */
  _waitForDiscovery() {
    return new Promise((resolve, reject) => {
      let unsubscribe = null;
      let timeout = null;

      const checkDiscovery = () => {
        const state = this.store.getState();
        const discovery = state.discovery || {};

        if (discovery.isFinished) {
          if (unsubscribe) unsubscribe();
          if (timeout) clearTimeout(timeout);
          resolve();
        } else if (discovery.failure) {
          if (unsubscribe) unsubscribe();
          if (timeout) clearTimeout(timeout);
          reject(new Error(`Discovery failed: ${discovery.failure.message || discovery.failure.code}`));
        }
      };

      // Check immediately in case discovery finished before we subscribed
      checkDiscovery();

      // Subscribe to store changes
      unsubscribe = this.store.subscribe(checkDiscovery);

      // Set a timeout to avoid waiting indefinitely
      timeout = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        reject(new Error('Discovery timeout: entitlement data loading took too long'));
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Format the discovery data into a consistent structure
   * @private
   * @param {Object} discovery - Raw discovery data from store
   * @returns {Object} Formatted entitlement data
   */
  _formatEntitlementData(discovery) {
    return {
      applications: discovery.applications || {},
      interfaces: discovery.interfaces || {},
      modules: discovery.modules || {},
      isFinished: discovery.isFinished || false,
      failure: discovery.failure || null,
      okapi: discovery.okapi || null,
      interfaceProviders: discovery.interfaceProviders || [],
      permissionDisplayNames: discovery.permissionDisplayNames || {}
    };
  }

  /**
   * Reset the service state (useful for testing)
   * @private
   */
  _reset() {
    this.discoveryPromise = null;
    this.listeners.clear();
  }
}

/**
 * Factory function to create an EntitlementService instance
 * @param {Object} store - Redux store instance
 * @returns {EntitlementService} New EntitlementService instance
 */
export function createEntitlementService(store) {
  return new EntitlementService(store);
}

/**
 * Singleton instance holder for the default entitlement service
 */
let defaultService = null;

/**
 * Get the default entitlement service instance
 * @param {Object} store - Redux store instance (required for first call)
 * @returns {EntitlementService} The default EntitlementService instance
 */
export function getEntitlementService(store) {
  if (!defaultService && store) {
    defaultService = createEntitlementService(store);
  }
  if (!defaultService) {
    throw new Error('EntitlementService not initialized. Please call getEntitlementService with a store first.');
  }
  return defaultService;
}

/**
 * Reset the default service (useful for testing)
 */
export function resetEntitlementService() {
  if (defaultService) {
    defaultService._reset();
  }
  defaultService = null;
}

export default EntitlementService;