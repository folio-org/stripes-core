/**
 * EntitlementService
 * 
 * Provides a unified Promise-based interface for accessing entitlement data,
 * whether it comes from static configuration (stripes-config.js) or dynamic 
 * API responses (/entitlements/tenant/applications).
 * 
 * This service abstracts away the source of entitlement data and ensures
 * all access is asynchronous, preparing for future dynamic loading features.
 */

import { config } from 'stripes-config';

class EntitlementService {
  constructor() {
    this.entitlementCache = null;
    this.entitlementPromise = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the entitlement service with the Redux store
   * @param {Object} store - Redux store instance
   */
  initialize(store) {
    this.store = store;
    this.isInitialized = true;
  }

  /**
   * Get entitlement data as a Promise
   * @returns {Promise<Object>} Entitlement data including applications, interfaces, modules
   */
  async getEntitlements() {
    if (!this.isInitialized) {
      throw new Error('EntitlementService must be initialized with a store before use');
    }

    // Return cached promise if already loading
    if (this.entitlementPromise) {
      return this.entitlementPromise;
    }

    // Return cached data if available
    if (this.entitlementCache) {
      return Promise.resolve(this.entitlementCache);
    }

    // Start loading entitlement data
    this.entitlementPromise = this._loadEntitlementData();
    
    try {
      this.entitlementCache = await this.entitlementPromise;
      this.entitlementPromise = null;
      return this.entitlementCache;
    } catch (error) {
      this.entitlementPromise = null;
      throw error;
    }
  }

  /**
   * Check if a specific interface is available
   * @param {string} name - Interface name
   * @param {string} versionWanted - Optional version requirement
   * @returns {Promise<boolean|string|undefined>} Interface availability
   */
  async hasInterface(name, versionWanted) {
    const entitlements = await this.getEntitlements();
    
    if (!entitlements.interfaces) {
      return undefined;
    }

    const version = entitlements.interfaces[name];
    if (!version) {
      return undefined;
    }

    if (!versionWanted) {
      return version;
    }

    // Use existing version compatibility logic
    return this._isVersionCompatible(version, versionWanted) ? versionWanted : false;
  }

  /**
   * Get applications data
   * @returns {Promise<Object>} Applications data
   */
  async getApplications() {
    const entitlements = await this.getEntitlements();
    return entitlements.applications || {};
  }

  /**
   * Get interfaces data
   * @returns {Promise<Object>} Interfaces data
   */
  async getInterfaces() {
    const entitlements = await this.getEntitlements();
    return entitlements.interfaces || {};
  }

  /**
   * Get modules data
   * @returns {Promise<Object>} Modules data
   */
  async getModules() {
    const entitlements = await this.getEntitlements();
    return entitlements.modules || {};
  }

  /**
   * Get interface providers data
   * @returns {Promise<Array>} Interface providers data
   */
  async getInterfaceProviders() {
    const entitlements = await this.getEntitlements();
    return entitlements.interfaceProviders || [];
  }

  /**
   * Check if entitlement loading is finished
   * @returns {Promise<boolean>} Whether loading is complete
   */
  async isFinished() {
    try {
      await this.getEntitlements();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cached entitlement data (useful for testing or re-initialization)
   */
  clearCache() {
    this.entitlementCache = null;
    this.entitlementPromise = null;
  }

  /**
   * Reset the service to uninitialized state (useful for testing)
   */
  reset() {
    this.entitlementCache = null;
    this.entitlementPromise = null;
    this.isInitialized = false;
    this.store = null;
  }

  /**
   * Internal method to load entitlement data from appropriate source
   * @private
   */
  async _loadEntitlementData() {
    if (!this.store) {
      throw new Error('Store not available for entitlement loading');
    }

    // Wait for any existing discovery data in the store
    return new Promise((resolve, reject) => {
      const checkDiscovery = () => {
        const state = this.store.getState();
        
        // If discovery is finished, use that data
        if (state.discovery?.isFinished) {
          resolve({
            applications: state.discovery.applications || {},
            interfaces: state.discovery.interfaces || {},
            modules: state.discovery.modules || {},
            interfaceProviders: state.discovery.interfaceProviders || [],
            permissionDisplayNames: state.discovery.permissionDisplayNames || {},
            isFinished: true
          });
          return;
        }

        // If discovery failed, resolve with empty data
        if (state.discovery?.failure) {
          resolve({
            applications: {},
            interfaces: {},
            modules: {},
            interfaceProviders: [],
            permissionDisplayNames: {},
            isFinished: true
          });
          return;
        }

        // If no discovery data yet, wait a bit and check again
        setTimeout(checkDiscovery, 100);
      };

      // Start checking
      checkDiscovery();

      // Set a timeout to prevent infinite waiting
      setTimeout(() => {
        reject(new Error('Timeout waiting for entitlement data'));
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Version compatibility check (copied from existing logic)
   * @private
   */
  _isVersionCompatible(got, wanted) {
    const isSingleVersionCompatible = (got, wanted) => {
      const [gmajor, gminor, gpatch] = got.split('.');
      const [wmajor, wminor, wpatch] = wanted.split('.');

      if (gmajor !== wmajor) return false;

      const gmint = parseInt(gminor, 10);
      const wmint = parseInt(wminor, 10);
      if (gmint < wmint) return false;
      if (gmint > wmint) return true;

      const gpint = parseInt(gpatch || '0', 10);
      const wpint = parseInt(wpatch || '0', 10);
      return gpint >= wpint;
    };

    return wanted.split(/\s+/).some(w => isSingleVersionCompatible(got, w));
  }
}

// Create singleton instance
const entitlementService = new EntitlementService();

export default entitlementService;