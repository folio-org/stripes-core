/**
 * entitlementService
 * 
 * Provides asynchronous access to entitlement data from stripes-config or API responses.
 * This service wraps both synchronous config access and asynchronous API calls in a
 * consistent Promise-based interface to prepare for future dynamic loading capabilities.
 * 
 * Entitlement data includes:
 * - Tenant configuration (from config.tenantOptions)
 * - Application descriptors (from /entitlements API)
 * - Module metadata
 */

import { config } from 'stripes-config';

/**
 * EntitlementService
 * Singleton service that provides Promise-based access to entitlement data
 */
class EntitlementService {
  constructor() {
    this._configCache = null;
    this._apiCache = null;
    this._initialized = false;
  }

  /**
   * Initialize the service with current entitlement data
   * This method can be called multiple times to refresh the data
   * 
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Always resolve synchronous config data as a Promise
      this._configCache = await this._loadConfigEntitlements();
      this._initialized = true;
    } catch (error) {
      console.error('Failed to initialize EntitlementService:', error);
      throw error;
    }
  }

  /**
   * Get tenant options from stripes-config
   * 
   * @returns {Promise<object>} Promise resolving to tenant options
   */
  async getTenantOptions() {
    if (!this._initialized) {
      await this.initialize();
    }
    
    return Promise.resolve(this._configCache?.tenantOptions || {});
  }

  /**
   * Get cached tenant options synchronously (for backwards compatibility)
   * This method should only be used when you need synchronous access
   * and the service might not be initialized yet
   * 
   * @returns {object} Cached tenant options or empty object
   * @throws {Error} If service is not initialized and config is not available
   */
  getCachedTenantOptions() {
    if (this._configCache && this._configCache.tenantOptions) {
      return this._configCache.tenantOptions;
    }
    
    // Fallback to direct config access if service not initialized
    if (config?.tenantOptions) {
      return config.tenantOptions;
    }
    
    // Return empty object instead of throwing to allow fallback logic
    return {};
  }

  /**
   * Get full configuration data
   * 
   * @returns {Promise<object>} Promise resolving to full config
   */
  async getConfig() {
    if (!this._initialized) {
      await this.initialize();
    }
    
    return Promise.resolve(this._configCache || {});
  }

  /**
   * Check if tenant options are available (indicating entitlement-based mode)
   * 
   * @returns {Promise<boolean>} Promise resolving to true if tenant options exist
   */
  async hasTenantOptions() {
    const tenantOptions = await this.getTenantOptions();
    return Object.keys(tenantOptions).length > 0;
  }

  /**
   * Get a specific tenant configuration by name
   * 
   * @param {string} tenantName - Name of the tenant
   * @returns {Promise<object|null>} Promise resolving to tenant config or null
   */
  async getTenantConfig(tenantName) {
    const tenantOptions = await this.getTenantOptions();
    return tenantOptions[tenantName] || null;
  }

  /**
   * Check if the system should use entitlement-based discovery
   * (equivalent to checking if config.tenantOptions exists)
   * 
   * @returns {Promise<boolean>} Promise resolving to true if should use entitlement mode
   */
  async shouldUseEntitlementMode() {
    return this.hasTenantOptions();
  }

  /**
   * Set API-sourced entitlement data (for future use)
   * This method allows storing entitlement data received from API calls
   * 
   * @param {object} apiData - Entitlement data from API
   * @returns {Promise<void>}
   */
  async setApiEntitlements(apiData) {
    this._apiCache = apiData;
    return Promise.resolve();
  }

  /**
   * Get API-sourced entitlement data
   * 
   * @returns {Promise<object|null>} Promise resolving to API entitlement data or null
   */
  async getApiEntitlements() {
    return Promise.resolve(this._apiCache);
  }

  /**
   * Clear all cached data and re-initialize
   * 
   * @returns {Promise<void>}
   */
  async refresh() {
    this._configCache = null;
    this._apiCache = null;
    this._initialized = false;
    return this.initialize();
  }

  /**
   * Load entitlement data from stripes-config
   * Private method that wraps synchronous config access
   * 
   * @private
   * @returns {Promise<object>} Promise resolving to config data
   */
  async _loadConfigEntitlements() {
    // Wrap synchronous config access in a Promise for consistent interface
    return new Promise((resolve) => {
      try {
        // Create a copy to avoid mutations affecting the original config
        const configData = {
          ...config,
          tenantOptions: config.tenantOptions ? { ...config.tenantOptions } : undefined
        };
        resolve(configData);
      } catch (error) {
        // If config is not available, resolve with empty object
        console.warn('stripes-config not available, using empty configuration:', error);
        resolve({});
      }
    });
  }
}

// Export singleton instance
const entitlementService = new EntitlementService();

export default entitlementService;

/**
 * Legacy helper functions for backwards compatibility
 * These maintain the existing API while adding Promise support
 */

/**
 * Get tenant options (backwards compatible)
 * 
 * @returns {Promise<object>} Promise resolving to tenant options
 */
export const getTenantOptions = () => entitlementService.getTenantOptions();

/**
 * Get configuration data (backwards compatible)
 * 
 * @returns {Promise<object>} Promise resolving to config
 */
export const getConfig = () => entitlementService.getConfig();

/**
 * Check if should use entitlement mode (backwards compatible)
 * 
 * @returns {Promise<boolean>} Promise resolving to boolean
 */
export const shouldUseEntitlementMode = () => entitlementService.shouldUseEntitlementMode();